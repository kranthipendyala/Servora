<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Review_model extends CI_Model
{
    protected $table = 'reviews';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get approved reviews for a business, with reviewer info.
     */
    public function get_by_business($business_id, $limit = 20, $offset = 0)
    {
        // Count from booking_reviews (via bookings table)
        $total = (int) $this->db->query("
            SELECT COUNT(*) AS cnt FROM booking_reviews br
            JOIN bookings bk ON bk.id = br.booking_id
            WHERE bk.business_id = ? AND br.is_approved = 1
        ", array($business_id))->row()->cnt;

        // Get approved reviews from booking_reviews
        $reviews = $this->db->select('br.id, br.rating, br.comment, br.vendor_reply, br.created_at, u.full_name AS reviewer_name')
            ->from('booking_reviews br')
            ->join('bookings bk', 'bk.id = br.booking_id')
            ->join('users u', 'u.id = br.customer_id', 'left')
            ->where('bk.business_id', $business_id)
            ->where('br.is_approved', 1)
            ->order_by('br.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->result();

        return array('reviews' => $reviews, 'total' => $total);
    }

    /**
     * Get reviews by a specific user.
     */
    public function get_by_user($user_id, $limit = 20, $offset = 0)
    {
        $total = $this->db->where('user_id', $user_id)
            ->count_all_results($this->table);

        $reviews = $this->db->select('r.id, r.rating, r.title, r.comment, r.is_approved, r.created_at, b.name AS business_name, b.slug AS business_slug')
            ->from('reviews r')
            ->join('businesses b', 'b.id = r.business_id', 'left')
            ->where('r.user_id', $user_id)
            ->order_by('r.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->result();

        return array('reviews' => $reviews, 'total' => $total);
    }

    /**
     * Create a new review.
     *
     * @param array $data Keys: business_id, user_id, rating, title, comment
     * @return int|false
     */
    public function create($data)
    {
        // Prevent duplicate reviews from same user for same business
        $existing = $this->db->where('business_id', $data['business_id'])
            ->where('user_id', $data['user_id'])
            ->count_all_results($this->table);

        if ($existing > 0) {
            return FALSE;
        }

        $rating = (int) $data['rating'];
        if ($rating < 1) $rating = 1;
        if ($rating > 5) $rating = 5;

        $insert = array(
            'business_id' => (int) $data['business_id'],
            'user_id'     => (int) $data['user_id'],
            'rating'      => $rating,
            'title'       => isset($data['title']) ? trim($data['title']) : '',
            'comment'     => isset($data['comment']) ? trim($data['comment']) : '',
            'is_approved' => 0,
            'created_at'  => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id() ?: FALSE;
    }

    /**
     * Approve a review and recalculate business rating.
     */
    public function approve($review_id)
    {
        // Check booking_reviews first, then legacy reviews
        $review = $this->db->get_where('booking_reviews', array('id' => $review_id))->row();
        $table = 'booking_reviews';
        if ( ! $review) {
            $review = $this->db->get_where($this->table, array('id' => $review_id))->row();
            $table = $this->table;
        }
        if ( ! $review) return FALSE;

        $this->db->where('id', $review_id)->update($table, array('is_approved' => 1));

        // Recalculate the business rating
        $business_id = isset($review->business_id) ? $review->business_id : NULL;
        if ( ! $business_id && isset($review->booking_id)) {
            $booking = $this->db->get_where('bookings', array('id' => $review->booking_id))->row();
            if ($booking) $business_id = $booking->business_id;
        }
        if ($business_id) {
            $this->load->model('Business_model');
            $this->Business_model->update_rating($business_id);
        }

        return TRUE;
    }

    /**
     * Reject / delete a review.
     */
    public function delete($review_id)
    {
        // Check booking_reviews first
        $review = $this->db->get_where('booking_reviews', array('id' => $review_id))->row();
        $table = 'booking_reviews';
        if ( ! $review) {
            $review = $this->db->get_where($this->table, array('id' => $review_id))->row();
            $table = $this->table;
        }
        if ( ! $review) return FALSE;

        $this->db->where('id', $review_id)->delete($table);

        // Recalculate rating
        $business_id = isset($review->business_id) ? $review->business_id : NULL;
        if ( ! $business_id && isset($review->booking_id)) {
            $booking = $this->db->get_where('bookings', array('id' => $review->booking_id))->row();
            if ($booking) $business_id = $booking->business_id;
        }
        if ($business_id) {
            $this->load->model('Business_model');
            $this->Business_model->update_rating($business_id);
        }

        return TRUE;
    }

    /**
     * Get all pending reviews (admin).
     */
    public function get_pending($limit = 20, $offset = 0)
    {
        $total = $this->db->where('is_approved', 0)
            ->count_all_results($this->table);

        $reviews = $this->db->select('r.*, u.full_name AS reviewer_name, u.email AS reviewer_email, b.name AS business_name, b.slug AS business_slug')
            ->from('reviews r')
            ->join('users u', 'u.id = r.user_id', 'left')
            ->join('businesses b', 'b.id = r.business_id', 'left')
            ->where('r.is_approved', 0)
            ->order_by('r.created_at', 'ASC')
            ->limit($limit, $offset)
            ->get()
            ->result();

        return array('reviews' => $reviews, 'total' => $total);
    }

    /**
     * Get all reviews with optional status filter (admin).
     */
    public function get_all($filters = array(), $limit = 20, $offset = 0)
    {
        // Get from both tables: booking_reviews (primary) + reviews (legacy)

        // Count from booking_reviews
        $this->db->from('booking_reviews r');
        if (isset($filters['status'])) {
            if ($filters['status'] === 'approved') $this->db->where('r.is_approved', 1);
            elseif ($filters['status'] === 'pending') $this->db->where('r.is_approved', 0);
        }
        $total = $this->db->count_all_results();

        // Data from booking_reviews
        $this->db->select('r.id, r.booking_id, r.customer_id AS user_id, r.vendor_id, r.rating, r.comment, r.vendor_reply, r.is_approved, IF(r.is_approved=1,"approved","pending") AS status, r.created_at,
            u.full_name AS reviewer_name, u.email AS reviewer_email,
            bk.booking_number, bk.business_id,
            b.name AS business_name, b.slug AS business_slug');
        $this->db->from('booking_reviews r');
        $this->db->join('users u', 'u.id = r.customer_id', 'left');
        $this->db->join('bookings bk', 'bk.id = r.booking_id', 'left');
        $this->db->join('businesses b', 'b.id = bk.business_id', 'left');

        if (isset($filters['status'])) {
            if ($filters['status'] === 'approved') $this->db->where('r.is_approved', 1);
            elseif ($filters['status'] === 'pending') $this->db->where('r.is_approved', 0);
        }

        $this->db->order_by('r.created_at', 'DESC');
        $this->db->limit($limit, $offset);
        $reviews = $this->db->get()->result();

        return array('reviews' => $reviews, 'total' => $total);
    }
}
