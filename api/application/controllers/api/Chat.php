<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Chat extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Chat_model');
    }

    /** GET /api/chat/conversations */
    public function my_conversations()
    {
        $this->_require_auth();
        $conversations = $this->Chat_model->get_conversations($this->current_user->id);
        $this->respond($conversations);
    }

    /** GET /api/chat/:booking_id */
    public function messages($booking_id)
    {
        $this->_require_auth();

        // Verify user is part of this booking
        $booking = $this->db->where('id', $booking_id)->get('bookings')->row();
        if ( ! $booking || ($booking->customer_id != $this->current_user->id && $booking->vendor_id != $this->current_user->id)) {
            $this->respond_error('Access denied', 403);
        }

        $conv = $this->Chat_model->get_or_create_conversation($booking_id, $booking->customer_id, $booking->vendor_id);
        $after_id = (int) $this->input->get('after_id');
        $messages = $this->Chat_model->get_messages($conv->id, 50, $after_id);

        // Mark as read
        $this->Chat_model->mark_read($conv->id, $this->current_user->id);

        $this->respond(array(
            'conversation_id' => $conv->id,
            'messages'        => $messages,
        ));
    }

    /** POST /api/chat/:booking_id */
    public function send($booking_id)
    {
        $this->_require_auth();

        $booking = $this->db->where('id', $booking_id)->get('bookings')->row();
        if ( ! $booking || ($booking->customer_id != $this->current_user->id && $booking->vendor_id != $this->current_user->id)) {
            $this->respond_error('Access denied', 403);
        }

        $data = $this->_get_json_body();
        if (empty($data['message'])) {
            $this->respond_error('Message is required', 422);
        }

        $conv = $this->Chat_model->get_or_create_conversation($booking_id, $booking->customer_id, $booking->vendor_id);

        $type = isset($data['type']) ? $data['type'] : 'text';
        $image = isset($data['image_url']) ? $data['image_url'] : NULL;

        $msg_id = $this->Chat_model->send_message($conv->id, $this->current_user->id, $data['message'], $type, $image);

        // Notify the other party
        $this->load->model('Notification_model');
        $recipient_id = ($this->current_user->id == $booking->customer_id) ? $booking->vendor_id : $booking->customer_id;
        $this->Notification_model->create(
            $recipient_id,
            'new_chat_message',
            'New Message',
            $this->current_user->full_name . ': ' . substr($data['message'], 0, 100),
            array('booking_id' => $booking_id, 'conversation_id' => $conv->id)
        );

        $this->respond(array('message_id' => $msg_id), 201, 'Message sent');
    }
}
