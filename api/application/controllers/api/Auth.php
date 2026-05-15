<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->library('User_tracker');
    }

    /**
     * POST /api/auth/register
     */
    public function register()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $data = $this->_get_json_body();

        $missing = $this->_validate_required($data, array('name', 'email', 'password'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        if ( ! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->respond_error('Invalid email address', 422);
        }

        if (strlen($data['password']) < 8) {
            $this->respond_error('Password must be at least 8 characters', 422);
        }

        // Force role to 'user' for public registration
        $data['role'] = 'user';

        $result = $this->User_model->register($data);

        if ($result === FALSE) {
            $this->respond_error('Email address is already registered', 409);
        }

        $this->user_tracker->log('register', $result['id'], array('email' => $data['email'], 'phone' => isset($data['phone']) ? $data['phone'] : NULL));
        $this->respond($result, 201, 'Registration successful');
    }

    /**
     * POST /api/auth/login
     */
    public function login()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $data = $this->_get_json_body();

        $missing = $this->_validate_required($data, array('email', 'password'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $result = $this->User_model->login($data['email'], $data['password']);

        if ($result === FALSE) {
            $this->respond_error('Invalid email or password', 401);
        }

        $this->user_tracker->log('login', $result['id'], array('email' => $data['email']));
        $this->respond($result, 200, 'Login successful');
    }

    /**
     * POST /api/auth/logout
     */
    public function logout()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->_require_auth();

        $this->User_model->invalidate_token($this->current_user->id);

        $this->respond(NULL, 200, 'Logged out successfully');
    }

    /**
     * GET /api/auth/profile
     */
    public function profile()
    {
        $this->_require_auth();

        $user = $this->User_model->get_by_id($this->current_user->id);

        if ( ! $user) {
            $this->respond_error('User not found', 404);
        }

        $this->respond($user);
    }

    /**
     * POST /api/auth/phone-login
     * OTP-based login/registration check.
     */
    public function phone_login()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('phone', 'otp'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $this->load->model('Otp_model');
        $purpose = isset($data['purpose']) ? $data['purpose'] : 'login';

        $valid = $this->Otp_model->verify($data['phone'], $data['otp'], $purpose);
        if ( ! $valid) {
            $this->respond_error('Invalid or expired OTP', 400);
        }

        // Check if user exists with this phone
        $user = $this->db->where('phone', $data['phone'])
            ->where('is_active', 1)
            ->get('users')
            ->row();

        if ($user) {
            // Existing user — generate token and login
            $token = bin2hex(random_bytes(32));
            $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

            $this->db->where('id', $user->id)->update('users', array(
                'api_token'        => hash('sha256', $token),
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                'phone_verified'   => 1,
                'updated_at'       => date('Y-m-d H:i:s'),
            ));

            $this->respond(array(
                'is_new_user'      => FALSE,
                'id'               => $user->id,
                'name'             => $user->full_name,
                'email'            => $user->email,
                'phone'            => $user->phone,
                'role'             => $user->role,
                'token'            => $token,
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                'onboarding_completed' => isset($user->onboarding_completed) ? (bool) $user->onboarding_completed : TRUE,
            ), 200, 'Login successful');

            $this->user_tracker->log('otp_login', $user->id, array('phone' => $data['phone'], 'email' => $user->email));
        } else {
            // New user — phone verified, frontend should complete profile
            $this->respond(array(
                'is_new_user'      => TRUE,
                'phone'            => $data['phone'],
                'phone_verified'   => TRUE,
            ), 200, 'Phone verified. Please complete your profile.');
        }
    }

    /**
     * POST /api/auth/complete-profile
     * Complete registration after OTP verification.
     */
    public function complete_profile()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('phone', 'name'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        // Check phone doesn't already have an account
        $existing = $this->db->where('phone', $data['phone'])->get('users')->row();
        if ($existing) {
            $this->respond_error('An account already exists with this phone number', 409);
        }

        // Determine role — default to 'user', allow 'vendor' if specified
        $role = 'user';
        if (isset($data['role']) && in_array($data['role'], array('user', 'vendor'))) {
            $role = $data['role'];
        }

        $token = bin2hex(random_bytes(32));
        $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

        $insert = array(
            'full_name'        => $data['name'],
            'email'            => isset($data['email']) && ! empty($data['email']) ? strtolower(trim($data['email'])) : NULL,
            'phone'            => $data['phone'],
            'phone_verified'   => 1,
            'password'         => NULL, // No password for OTP users
            'role'             => $role,
            'api_token'        => hash('sha256', $token),
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            'is_active'        => 1,
            'onboarding_completed' => $role === 'user' ? 1 : 0,
            'created_at'       => date('Y-m-d H:i:s'),
            'updated_at'       => date('Y-m-d H:i:s'),
        );

        // Check email uniqueness if provided
        if ( ! empty($insert['email'])) {
            $email_exists = $this->db->where('email', $insert['email'])->get('users')->row();
            if ($email_exists) {
                $this->respond_error('Email address is already registered', 409);
            }
        }

        $this->db->insert('users', $insert);
        $user_id = $this->db->insert_id();

        if ( ! $user_id) {
            $this->respond_error('Failed to create account', 500);
        }

        $this->respond(array(
            'is_new_user'      => TRUE,
            'id'               => $user_id,
            'name'             => $insert['full_name'],
            'email'            => $insert['email'],
            'phone'            => $insert['phone'],
            'role'             => $insert['role'],
            'token'            => $token,
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            'onboarding_completed' => (bool) $insert['onboarding_completed'],
        ), 201, 'Account created successfully');

        $this->user_tracker->log('register', $user_id, array('phone' => $data['phone'], 'email' => isset($data['email']) ? $data['email'] : NULL, 'method' => 'otp'));
    }

    /**
     * POST /api/auth/google-login
     * Login/register via Google ID token.
     */
    public function google_login()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $data = $this->_get_json_body();
        if (empty($data['google_token'])) {
            $this->respond_error('Google token is required', 422);
        }

        // Verify token with Google
        $google_data = $this->_verify_google_token($data['google_token']);
        if ( ! $google_data) {
            $this->respond_error('Invalid Google token', 401);
        }

        $google_id = $google_data['sub'];
        $email = isset($google_data['email']) ? $google_data['email'] : NULL;
        $name = isset($google_data['name']) ? $google_data['name'] : 'User';

        // Find user by google_id or email
        $user = $this->db->where('google_id', $google_id)->get('users')->row();
        if ( ! $user && $email) {
            $user = $this->db->where('email', $email)->get('users')->row();
        }

        $token = bin2hex(random_bytes(32));
        $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

        if ($user) {
            // Existing user — update google_id and login
            $this->db->where('id', $user->id)->update('users', array(
                'google_id'        => $google_id,
                'api_token'        => hash('sha256', $token),
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                'updated_at'       => date('Y-m-d H:i:s'),
            ));

            $this->respond(array(
                'is_new_user'      => FALSE,
                'id'               => $user->id,
                'name'             => $user->full_name,
                'email'            => $user->email,
                'phone'            => $user->phone,
                'role'             => $user->role,
                'token'            => $token,
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            ), 200, 'Login successful');

            $this->user_tracker->log('google_login', $user->id, array('email' => $user->email, 'google_id' => $google_id));
        } else {
            // New user — create account
            $this->db->insert('users', array(
                'full_name'        => $name,
                'email'            => $email,
                'phone'            => NULL,
                'password'         => NULL,
                'role'             => 'user',
                'google_id'        => $google_id,
                'api_token'        => hash('sha256', $token),
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
                'is_active'        => 1,
                'onboarding_completed' => 1,
                'created_at'       => date('Y-m-d H:i:s'),
                'updated_at'       => date('Y-m-d H:i:s'),
            ));
            $user_id = $this->db->insert_id();

            $this->respond(array(
                'is_new_user'      => TRUE,
                'id'               => $user_id,
                'name'             => $name,
                'email'            => $email,
                'phone'            => NULL,
                'role'             => 'user',
                'token'            => $token,
                'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            ), 201, 'Account created successfully');

            $this->user_tracker->log('google_login', $user_id, array('email' => $email, 'google_id' => $google_id, 'is_new' => true));
        }
    }

    /**
     * Verify Google ID token.
     */
    private function _verify_google_token($id_token)
    {
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200) {
            return FALSE;
        }

        $data = json_decode($response, TRUE);
        if ( ! $data || empty($data['sub'])) {
            return FALSE;
        }

        return $data;
    }
}
