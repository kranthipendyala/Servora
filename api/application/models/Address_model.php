<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Address_model extends CI_Model
{
    protected $table = 'addresses';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all addresses for a user.
     */
    public function get_by_user($user_id)
    {
        return $this->db->select('a.*, c.name AS city_name, l.name AS locality_name, s.name AS state_name')
            ->from('addresses a')
            ->join('cities c', 'c.id = a.city_id', 'left')
            ->join('localities l', 'l.id = a.locality_id', 'left')
            ->join('states s', 's.id = a.state_id', 'left')
            ->where('a.user_id', $user_id)
            ->order_by('a.is_default', 'DESC')
            ->order_by('a.created_at', 'DESC')
            ->get()
            ->result();
    }

    /**
     * Get a single address by ID.
     */
    public function get_by_id($id)
    {
        return $this->db->select('a.*, c.name AS city_name, l.name AS locality_name, s.name AS state_name')
            ->from('addresses a')
            ->join('cities c', 'c.id = a.city_id', 'left')
            ->join('localities l', 'l.id = a.locality_id', 'left')
            ->join('states s', 's.id = a.state_id', 'left')
            ->where('a.id', $id)
            ->get()
            ->row();
    }

    /**
     * Create an address.
     */
    public function create($data)
    {
        // If this is the first address or marked as default, reset others
        if ( ! empty($data['is_default'])) {
            $this->db->where('user_id', $data['user_id']);
            $this->db->update($this->table, array('is_default' => 0));
        }

        $insert = array(
            'user_id'       => $data['user_id'],
            'label'         => isset($data['label']) ? $data['label'] : 'Home',
            'full_name'     => isset($data['full_name']) ? $data['full_name'] : NULL,
            'phone'         => isset($data['phone']) ? $data['phone'] : NULL,
            'address_line1' => $data['address_line1'],
            'address_line2' => isset($data['address_line2']) ? $data['address_line2'] : NULL,
            'city_id'       => isset($data['city_id']) ? $data['city_id'] : NULL,
            'locality_id'   => isset($data['locality_id']) ? $data['locality_id'] : NULL,
            'state_id'      => isset($data['state_id']) ? $data['state_id'] : NULL,
            'pin_code'      => $data['pin_code'],
            'latitude'      => isset($data['latitude']) ? $data['latitude'] : NULL,
            'longitude'     => isset($data['longitude']) ? $data['longitude'] : NULL,
            'is_default'    => ! empty($data['is_default']) ? 1 : 0,
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        $id = $this->db->insert_id();

        return $id ? $this->get_by_id($id) : FALSE;
    }

    /**
     * Update an address.
     */
    public function update($id, $data)
    {
        $allowed = array('label', 'full_name', 'phone', 'address_line1', 'address_line2',
            'city_id', 'locality_id', 'state_id', 'pin_code', 'latitude', 'longitude', 'is_default');
        $update = array();

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        if (empty($update)) {
            return FALSE;
        }

        // If setting as default, reset others
        if ( ! empty($update['is_default'])) {
            $address = $this->db->where('id', $id)->get($this->table)->row();
            if ($address) {
                $this->db->where('user_id', $address->user_id);
                $this->db->update($this->table, array('is_default' => 0));
            }
        }

        $update['updated_at'] = date('Y-m-d H:i:s');

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    /**
     * Delete an address.
     */
    public function delete($id)
    {
        $this->db->where('id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Check if address belongs to user.
     */
    public function belongs_to_user($address_id, $user_id)
    {
        return $this->db->where('id', $address_id)
            ->where('user_id', $user_id)
            ->count_all_results($this->table) > 0;
    }
}
