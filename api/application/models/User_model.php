<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model
{
    protected $table = 'users';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Register a new user.
     *
     * @param array $data Keys: name, email, password, phone (optional), role (optional)
     * @return array|false  User data with token on success, false on failure
     */
    public function register($data)
    {
        // Check if email already exists
        if ($this->get_by_email($data['email'])) {
            return FALSE;
        }

        $token = $this->_generate_random_token();
        $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

        $insert = array(
            'full_name'        => $data['name'],
            'email'            => strtolower(trim($data['email'])),
            'password'         => password_hash($data['password'], PASSWORD_BCRYPT, array('cost' => 12)),
            'phone'            => isset($data['phone']) ? $data['phone'] : '',
            'role'             => isset($data['role']) ? $data['role'] : 'user',
            'api_token'        => hash('sha256', $token),
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            'is_active'        => 1,
            'created_at'       => date('Y-m-d H:i:s'),
            'updated_at'       => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        $user_id = $this->db->insert_id();

        if ( ! $user_id) {
            return FALSE;
        }

        return array(
            'id'    => $user_id,
            'name'  => $insert['full_name'],
            'email' => $insert['email'],
            'role'  => $insert['role'],
            'token' => $token,
            'token_expires_at' => $insert['token_expires_at'],
        );
    }

    /**
     * Authenticate user with email and password.
     *
     * @param string $email
     * @param string $password
     * @return array|false  User data with new token on success
     */
    public function login($email, $password)
    {
        $user = $this->get_by_email($email);

        if ( ! $user) {
            return FALSE;
        }

        if ( ! $user->is_active) {
            return FALSE;
        }

        if ( ! password_verify($password, $user->password)) {
            return FALSE;
        }

        // Generate new token on each login
        $token = $this->_generate_random_token();
        $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

        $this->db->where('id', $user->id);
        $this->db->update($this->table, array(
            'api_token'        => hash('sha256', $token),
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            'updated_at'       => date('Y-m-d H:i:s'),
        ));

        return array(
            'id'    => $user->id,
            'name'  => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role'  => $user->role,
            'token' => $token,
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
        );
    }

    /**
     * Look up a user by their hashed API token.
     * Used by the auth middleware in Base_Api_Controller.
     *
     * @param string $raw_token The raw token from the Authorization header
     * @return object|null
     */
    public function get_by_token($raw_token)
    {
        $hashed = hash('sha256', $raw_token);

        return $this->db->select('id, full_name, email, phone, role, token_expires_at, is_active')
            ->from($this->table)
            ->where('api_token', $hashed)
            ->where('is_active', 1)
            ->get()
            ->row();
    }

    /**
     * Invalidate a user's token (logout).
     *
     * @param int $user_id
     * @return bool
     */
    public function invalidate_token($user_id)
    {
        $this->db->where('id', $user_id);
        return $this->db->update($this->table, array(
            'api_token'        => NULL,
            'token_expires_at' => NULL,
            'updated_at'       => date('Y-m-d H:i:s'),
        ));
    }

    /**
     * Get user by email.
     */
    public function get_by_email($email)
    {
        return $this->db->get_where($this->table, array(
            'email' => strtolower(trim($email))
        ))->row();
    }

    /**
     * Get user by ID (without password).
     */
    public function get_by_id($id)
    {
        return $this->db->select('id, full_name AS name, full_name, email, phone, role, is_active, created_at')
            ->from($this->table)
            ->where('id', $id)
            ->get()
            ->row();
    }

    /**
     * Get all users (admin).
     */
    public function get_all($limit = 50, $offset = 0, $filters = array())
    {
        if ( ! empty($filters['role'])) {
            $this->db->where('role', $filters['role']);
        }
        if ( ! empty($filters['search'])) {
            $this->db->group_start();
            $this->db->like('full_name', $filters['search']);
            $this->db->or_like('email', $filters['search']);
            $this->db->or_like('phone', $filters['search']);
            $this->db->group_end();
        }
        $total = $this->db->count_all_results($this->table, FALSE);

        $users = $this->db->select('id, full_name AS name, email, phone, role, is_active, created_at')
            ->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->result();

        return array('users' => $users, 'total' => $total);
    }

    /**
     * Update user data (admin).
     */
    public function update($id, $data)
    {
        $allowed = array('full_name', 'email', 'phone', 'role', 'is_active');
        $update = array();

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        // Support 'name' as alias for 'full_name'
        if (array_key_exists('name', $data) && ! array_key_exists('full_name', $data)) {
            $update['full_name'] = $data['name'];
        }

        if (empty($update)) {
            return FALSE;
        }

        $update['updated_at'] = date('Y-m-d H:i:s');

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    /**
     * Generate a cryptographically secure random token.
     */
    private function _generate_random_token()
    {
        return bin2hex(random_bytes(32));
    }
}
