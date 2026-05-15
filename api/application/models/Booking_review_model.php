<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Booking_review_model extends CI_Model
{
    protected $table = 'booking_reviews';

    public function __construct()
    {
        parent::__construct();
    }

    public function create($data)
    {
        $existing = $this->db->where('booking_id', $data['booking_id'])->get($this->table)->row();
        if ($existing) return FALSE;

        $this->db->insert($this->table, array(
            'booking_id'  => $data['booking_id'],
            'customer_id' => $data['customer_id'],
            'vendor_id'   => $data['vendor_id'],
            'rating'      => $data['rating'],
            'comment'     => isset($data['comment']) ? $data['comment'] : NULL,
            'is_approved' => 1,
            'created_at'  => date('Y-m-d H:i:s'),
        ));
        return $this->db->insert_id();
    }

    public function add_vendor_reply($review_id, $vendor_id, $reply)
    {
        $review = $this->db->where('id', $review_id)->where('vendor_id', $vendor_id)->get($this->table)->row();
        if ( ! $review) return FALSE;

        $this->db->where('id', $review_id)->update($this->table, array(
            'vendor_reply'     => $reply,
            'vendor_replied_at'=> date('Y-m-d H:i:s'),
        ));
        return TRUE;
    }

    public function get_by_vendor($vendor_id, $limit = 20, $offset = 0)
    {
        $total = $this->db->where('vendor_id', $vendor_id)->count_all_results($this->table);

        $reviews = $this->db->select('br.*, u.full_name AS customer_name, b.booking_number')
            ->from('booking_reviews br')
            ->join('users u', 'u.id = br.customer_id')
            ->join('bookings b', 'b.id = br.booking_id')
            ->where('br.vendor_id', $vendor_id)
            ->order_by('br.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()->result();

        return array('reviews' => $reviews, 'total' => $total);
    }

    public function get_by_booking($booking_id)
    {
        return $this->db->select('br.*, u.full_name AS customer_name')
            ->from('booking_reviews br')
            ->join('users u', 'u.id = br.customer_id')
            ->where('br.booking_id', $booking_id)
            ->get()->row();
    }

    public function get_vendor_avg_rating($vendor_id)
    {
        $result = $this->db->select_avg('rating', 'avg_rating')
            ->select('COUNT(*) AS total_reviews', FALSE)
            ->where('vendor_id', $vendor_id)
            ->where('is_approved', 1)
            ->get($this->table)->row();
        return array(
            'avg_rating'    => $result ? round((float)$result->avg_rating, 1) : 0,
            'total_reviews' => $result ? (int)$result->total_reviews : 0,
        );
    }
}
