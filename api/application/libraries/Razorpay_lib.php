<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Razorpay Payment Gateway Library
 *
 * Handles order creation, payment verification, and refunds.
 * Requires razorpay_key_id and razorpay_key_secret in settings table.
 */
class Razorpay_lib
{
    private $CI;
    private $key_id;
    private $key_secret;
    private $webhook_secret;
    private $base_url = 'https://api.razorpay.com/v1';

    public function __construct()
    {
        $this->CI =& get_instance();
        $this->CI->load->database();

        // Load credentials from settings table
        $this->key_id = $this->_get_setting('razorpay_key_id');
        $this->key_secret = $this->_get_setting('razorpay_key_secret');
        $this->webhook_secret = $this->_get_setting('razorpay_webhook_secret');
    }

    /**
     * Create a Razorpay order.
     *
     * @param float  $amount   Amount in INR (will be converted to paise)
     * @param string $receipt  Unique receipt ID (e.g. booking number)
     * @param array  $notes    Optional key-value notes
     * @return array|false     Razorpay order object or false on failure
     */
    public function create_order($amount, $receipt, $notes = array())
    {
        $payload = array(
            'amount'   => (int) round($amount * 100), // Convert to paise
            'currency' => 'INR',
            'receipt'  => $receipt,
            'notes'    => $notes,
        );

        $response = $this->_request('POST', '/orders', $payload);

        if ($response && isset($response['id'])) {
            return $response;
        }

        return FALSE;
    }

    /**
     * Verify payment signature (after checkout).
     *
     * @param string $order_id   Razorpay order ID
     * @param string $payment_id Razorpay payment ID
     * @param string $signature  Signature from checkout response
     * @return bool
     */
    public function verify_signature($order_id, $payment_id, $signature)
    {
        $payload = $order_id . '|' . $payment_id;
        $expected = hash_hmac('sha256', $payload, $this->key_secret);

        return hash_equals($expected, $signature);
    }

    /**
     * Fetch payment details.
     *
     * @param string $payment_id
     * @return array|false
     */
    public function fetch_payment($payment_id)
    {
        return $this->_request('GET', '/payments/' . $payment_id);
    }

    /**
     * Capture an authorized payment.
     *
     * @param string $payment_id
     * @param float  $amount Amount in INR
     * @return array|false
     */
    public function capture_payment($payment_id, $amount)
    {
        return $this->_request('POST', '/payments/' . $payment_id . '/capture', array(
            'amount'   => (int) round($amount * 100),
            'currency' => 'INR',
        ));
    }

    /**
     * Create a refund.
     *
     * @param string $payment_id
     * @param float  $amount Refund amount in INR
     * @param array  $notes  Optional notes
     * @return array|false
     */
    public function create_refund($payment_id, $amount, $notes = array())
    {
        return $this->_request('POST', '/payments/' . $payment_id . '/refund', array(
            'amount' => (int) round($amount * 100),
            'notes'  => $notes,
        ));
    }

    /**
     * Verify webhook signature.
     *
     * @param string $body      Raw request body
     * @param string $signature X-Razorpay-Signature header value
     * @return bool
     */
    public function verify_webhook_signature($body, $signature)
    {
        if (empty($this->webhook_secret)) {
            return FALSE;
        }

        $expected = hash_hmac('sha256', $body, $this->webhook_secret);
        return hash_equals($expected, $signature);
    }

    /**
     * Make HTTP request to Razorpay API.
     */
    private function _request($method, $endpoint, $data = NULL)
    {
        $url = $this->base_url . $endpoint;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_USERPWD, $this->key_id . ':' . $this->key_secret);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $headers = array('Content-Type: application/json');

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, TRUE);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code >= 200 && $http_code < 300) {
            return json_decode($response, TRUE);
        }

        log_message('error', 'Razorpay API error: HTTP ' . $http_code . ' - ' . $response);
        return FALSE;
    }

    /**
     * Get a setting value from the settings table.
     */
    private function _get_setting($key)
    {
        $row = $this->CI->db->where('setting_key', $key)->get('settings')->row();
        return $row ? $row->setting_value : '';
    }
}
