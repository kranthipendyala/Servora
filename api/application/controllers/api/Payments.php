<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payments extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Payment_model');
        $this->load->model('Booking_model');
        $this->load->model('Notification_model');
        $this->load->library('Razorpay_lib');
    }

    /**
     * POST /api/payments/create-order
     * Create a Razorpay order for a booking.
     */
    public function create_order()
    {
        $this->_require_auth();

        $data = $this->_get_json_body();
        if (empty($data['booking_id'])) {
            $this->respond_error('booking_id is required', 422);
        }

        $booking = $this->Booking_model->get_by_id($data['booking_id']);
        if ( ! $booking) {
            $this->respond_error('Booking not found', 404);
        }

        if ($booking->customer_id != $this->current_user->id) {
            $this->respond_error('Access denied', 403);
        }

        if ($booking->payment_status === 'paid') {
            $this->respond_error('Booking is already paid', 400);
        }

        // Create Razorpay order
        $order = $this->razorpay_lib->create_order(
            $booking->total_amount,
            $booking->booking_number,
            array(
                'booking_id' => $booking->id,
                'customer_id' => $this->current_user->id,
            )
        );

        if ( ! $order) {
            $this->respond_error('Failed to create payment order. Please try again.', 500);
        }

        // Record in payments table
        $this->Payment_model->create(array(
            'booking_id'        => $booking->id,
            'user_id'           => $this->current_user->id,
            'razorpay_order_id' => $order['id'],
            'amount'            => $booking->total_amount,
        ));

        $this->respond(array(
            'razorpay_order_id' => $order['id'],
            'amount'            => (int) round($booking->total_amount * 100),
            'currency'          => 'INR',
            'booking_number'    => $booking->booking_number,
        ), 201, 'Payment order created');
    }

    /**
     * POST /api/payments/verify
     * Verify payment after Razorpay checkout.
     */
    public function verify()
    {
        $this->_require_auth();

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'));

        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        // Verify signature
        $valid = $this->razorpay_lib->verify_signature(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature']
        );

        if ( ! $valid) {
            // Mark payment as failed
            $this->Payment_model->mark_failed($data['razorpay_order_id'], array(
                'error' => 'Signature verification failed',
            ));
            $this->respond_error('Payment verification failed', 400);
        }

        // Get payment record
        $payment = $this->Payment_model->get_by_order_id($data['razorpay_order_id']);
        if ( ! $payment) {
            $this->respond_error('Payment record not found', 404);
        }

        // Fetch payment method from Razorpay
        $rz_payment = $this->razorpay_lib->fetch_payment($data['razorpay_payment_id']);
        $method = $rz_payment ? ($rz_payment['method'] ?? NULL) : NULL;

        // Update payment record
        $this->Payment_model->mark_captured(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature'],
            $method
        );

        // Update booking
        $this->Booking_model->update_payment_status($payment->booking_id, 'paid', $method);
        $this->Booking_model->update_status($payment->booking_id, 'confirmed');

        // Notify vendor
        $booking = $this->Booking_model->get_by_id($payment->booking_id);
        if ($booking && $booking->vendor_id) {
            $this->Notification_model->create(
                $booking->vendor_id,
                'payment_received',
                'Payment Received',
                'Payment of ₹' . $booking->total_amount . ' received for booking #' . $booking->booking_number,
                array('booking_id' => $booking->id)
            );
        }

        $this->respond(array(
            'booking'    => $booking,
            'payment_id' => $data['razorpay_payment_id'],
        ), 200, 'Payment verified successfully');
    }

    /**
     * POST /api/payments/webhook
     * Handle Razorpay webhook events.
     */
    public function webhook()
    {
        $raw_body = file_get_contents('php://input');
        $signature = isset($_SERVER['HTTP_X_RAZORPAY_SIGNATURE']) ? $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] : '';

        if ( ! $this->razorpay_lib->verify_webhook_signature($raw_body, $signature)) {
            $this->respond_error('Invalid webhook signature', 400);
        }

        $event = json_decode($raw_body, TRUE);
        if ( ! $event) {
            $this->respond_error('Invalid JSON', 400);
        }

        $event_type = isset($event['event']) ? $event['event'] : '';

        switch ($event_type) {
            case 'payment.captured':
                $payment_entity = $event['payload']['payment']['entity'];
                $order_id = $payment_entity['order_id'];

                $payment = $this->Payment_model->get_by_order_id($order_id);
                if ($payment && $payment->status !== 'captured') {
                    $this->Payment_model->mark_captured(
                        $order_id,
                        $payment_entity['id'],
                        '',
                        $payment_entity['method']
                    );
                    $this->Booking_model->update_payment_status($payment->booking_id, 'paid', $payment_entity['method']);
                    $this->Booking_model->update_status($payment->booking_id, 'confirmed');
                }
                break;

            case 'payment.failed':
                $payment_entity = $event['payload']['payment']['entity'];
                $order_id = $payment_entity['order_id'];
                $this->Payment_model->mark_failed($order_id, $payment_entity);

                $payment = $this->Payment_model->get_by_order_id($order_id);
                if ($payment) {
                    $this->Booking_model->update_payment_status($payment->booking_id, 'failed');
                }
                break;

            case 'refund.processed':
                $refund_entity = $event['payload']['refund']['entity'];
                $payment_id_rz = $refund_entity['payment_id'];
                // Find payment by razorpay_payment_id
                $this->db->where('razorpay_payment_id', $payment_id_rz);
                $payment = $this->db->get('payments')->row();
                if ($payment) {
                    $refund_amount = $refund_entity['amount'] / 100;
                    $this->Payment_model->mark_refunded($payment->id, $refund_amount, $refund_entity['id']);
                    $this->Booking_model->update_payment_status($payment->booking_id, 'refunded');
                    $this->Booking_model->update_status($payment->booking_id, 'refunded');
                }
                break;
        }

        $this->respond(array('status' => 'ok'));
    }
}
