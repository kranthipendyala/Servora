<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payment_model extends CI_Model
{
    protected $table = 'payments';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Create a payment record when Razorpay order is created.
     */
    public function create($data)
    {
        $insert = array(
            'booking_id'        => $data['booking_id'],
            'user_id'           => $data['user_id'],
            'razorpay_order_id' => $data['razorpay_order_id'],
            'amount'            => $data['amount'],
            'currency'          => isset($data['currency']) ? $data['currency'] : 'INR',
            'status'            => 'created',
            'created_at'        => date('Y-m-d H:i:s'),
            'updated_at'        => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    /**
     * Update payment after verification.
     */
    public function mark_captured($razorpay_order_id, $razorpay_payment_id, $razorpay_signature, $method = NULL)
    {
        $this->db->where('razorpay_order_id', $razorpay_order_id);
        return $this->db->update($this->table, array(
            'razorpay_payment_id' => $razorpay_payment_id,
            'razorpay_signature'  => $razorpay_signature,
            'status'              => 'captured',
            'method'              => $method,
            'updated_at'          => date('Y-m-d H:i:s'),
        ));
    }

    /**
     * Mark payment as failed.
     */
    public function mark_failed($razorpay_order_id, $response = NULL)
    {
        $this->db->where('razorpay_order_id', $razorpay_order_id);
        return $this->db->update($this->table, array(
            'status'           => 'failed',
            'gateway_response' => $response ? json_encode($response) : NULL,
            'updated_at'       => date('Y-m-d H:i:s'),
        ));
    }

    /**
     * Process refund.
     */
    public function mark_refunded($payment_id, $refund_amount, $refund_id)
    {
        $this->db->where('id', $payment_id);
        return $this->db->update($this->table, array(
            'status'        => 'refunded',
            'refund_amount' => $refund_amount,
            'refund_id'     => $refund_id,
            'updated_at'    => date('Y-m-d H:i:s'),
        ));
    }

    /**
     * Get payment by Razorpay order ID.
     */
    public function get_by_order_id($razorpay_order_id)
    {
        return $this->db->where('razorpay_order_id', $razorpay_order_id)
            ->get($this->table)
            ->row();
    }

    /**
     * Get payment by booking ID.
     */
    public function get_by_booking($booking_id)
    {
        return $this->db->where('booking_id', $booking_id)
            ->order_by('created_at', 'DESC')
            ->get($this->table)
            ->row();
    }

    /**
     * Get payments for a user.
     */
    public function get_by_user($user_id, $limit = 20, $offset = 0)
    {
        $total = $this->db->where('user_id', $user_id)->count_all_results($this->table);

        $payments = $this->db->select('p.*, b.booking_number')
            ->from('payments p')
            ->join('bookings b', 'b.id = p.booking_id', 'left')
            ->where('p.user_id', $user_id)
            ->order_by('p.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->result();

        return array('payments' => $payments, 'total' => $total);
    }
}
