<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Booking_reviews extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Booking_review_model');
        $this->load->model('Notification_model');
    }

    /** POST /api/bookings/:id/review */
    public function submit($booking_id)
    {
        $this->_require_auth();

        $booking = $this->db->where('id', $booking_id)->get('bookings')->row();
        if ( ! $booking || $booking->customer_id != $this->current_user->id) {
            $this->respond_error('Booking not found', 404);
        }
        if ($booking->status !== 'completed') {
            $this->respond_error('Can only review completed bookings', 400);
        }

        $data = $this->_get_json_body();
        if (empty($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
            $this->respond_error('Rating must be between 1 and 5', 422);
        }

        $id = $this->Booking_review_model->create(array(
            'booking_id'  => $booking_id,
            'customer_id' => $this->current_user->id,
            'vendor_id'   => $booking->vendor_id,
            'rating'      => $data['rating'],
            'comment'     => isset($data['comment']) ? $data['comment'] : NULL,
        ));

        if ( ! $id) {
            $this->respond_error('Review already exists for this booking', 409);
        }

        $this->Notification_model->create(
            $booking->vendor_id,
            'review_received',
            'New Review',
            $this->current_user->full_name . ' left a ' . $data['rating'] . '-star review',
            array('booking_id' => $booking_id, 'review_id' => $id)
        );

        $this->respond($this->Booking_review_model->get_by_booking($booking_id), 201, 'Review submitted');
    }

    /** POST /api/vendor/reviews/:id/reply */
    public function reply($review_id)
    {
        $this->_require_role(array('vendor', 'business_owner'));

        $data = $this->_get_json_body();
        if (empty($data['reply'])) {
            $this->respond_error('Reply is required', 422);
        }

        $result = $this->Booking_review_model->add_vendor_reply($review_id, $this->current_user->id, $data['reply']);
        if ( ! $result) {
            $this->respond_error('Review not found', 404);
        }

        $this->respond(NULL, 200, 'Reply added');
    }

    /** GET /api/vendor/reviews */
    public function vendor_reviews()
    {
        $this->_require_role(array('vendor', 'business_owner'));
        $pagination = $this->_get_pagination();
        $result = $this->Booking_review_model->get_by_vendor($this->current_user->id, $pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }
}
