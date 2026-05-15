<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Otp extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Otp_model');
    }

    /**
     * POST /api/otp/send
     */
    public function send()
    {
        $data = $this->_get_json_body();

        if (empty($data['phone'])) {
            $this->respond_error('Phone number is required', 422);
        }

        $purpose = isset($data['purpose']) ? $data['purpose'] : 'login';

        $otp = $this->Otp_model->generate($data['phone'], $purpose);

        if ($otp === FALSE) {
            $this->respond_error('Too many OTP requests. Please wait and try again.', 429);
        }

        // TODO: Send OTP via SMS provider (MSG91, Twilio, etc.)
        // For now, return OTP in response for development
        $response = array(
            'message' => 'OTP sent successfully',
            'phone'   => $data['phone'],
        );

        // Include OTP in development mode only
        if (ENVIRONMENT === 'development') {
            $response['otp'] = $otp;
        }

        $this->respond($response, 200, 'OTP sent successfully');
    }

    /**
     * POST /api/otp/verify
     */
    public function verify()
    {
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('phone', 'otp'));

        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $purpose = isset($data['purpose']) ? $data['purpose'] : 'login';

        $valid = $this->Otp_model->verify($data['phone'], $data['otp'], $purpose);

        if ( ! $valid) {
            $this->respond_error('Invalid or expired OTP', 400);
        }

        // If purpose is login/register, handle auth
        if (in_array($purpose, array('login', 'register'))) {
            $this->load->model('User_model');

            // Find user by phone
            $user = $this->db->where('phone', $data['phone'])
                ->where('is_active', 1)
                ->get('users')
                ->row();

            if ($user) {
                // Generate token for existing user
                $token = bin2hex(random_bytes(32));
                $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

                $this->db->where('id', $user->id)->update('users', array(
                    'api_token'        => hash('sha256', $token),
                    'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                    'phone_verified'   => 1,
                    'updated_at'       => date('Y-m-d H:i:s'),
                ));

                $this->respond(array(
                    'id'               => $user->id,
                    'name'             => $user->full_name,
                    'email'            => $user->email,
                    'phone'            => $user->phone,
                    'role'             => $user->role,
                    'token'            => $token,
                    'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                    'is_new_user'      => FALSE,
                ), 200, 'Login successful');
            } else {
                // Return verified flag so frontend can complete registration
                $this->respond(array(
                    'phone'       => $data['phone'],
                    'verified'    => TRUE,
                    'is_new_user' => TRUE,
                ), 200, 'Phone verified. Please complete registration.');
            }
        } else {
            // For verify_phone or reset_password
            if ($purpose === 'verify_phone') {
                $this->db->where('phone', $data['phone'])->update('users', array(
                    'phone_verified' => 1,
                    'updated_at'     => date('Y-m-d H:i:s'),
                ));
            }

            $this->respond(array('verified' => TRUE), 200, 'OTP verified successfully');
        }
    }
}
