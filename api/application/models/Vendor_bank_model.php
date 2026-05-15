<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vendor_bank_model extends CI_Model
{
    protected $table = 'vendor_bank_details';

    public function __construct()
    {
        parent::__construct();
    }

    public function get_by_vendor($vendor_id)
    {
        return $this->db->where('vendor_id', $vendor_id)->get($this->table)->row();
    }

    public function save($vendor_id, $data)
    {
        $existing = $this->get_by_vendor($vendor_id);

        $row = array(
            'vendor_id'           => $vendor_id,
            'account_holder_name' => $data['account_holder_name'],
            'account_number'      => $data['account_number'],
            'ifsc_code'           => $data['ifsc_code'],
            'bank_name'           => isset($data['bank_name']) ? $data['bank_name'] : NULL,
            'branch'              => isset($data['branch']) ? $data['branch'] : NULL,
            'upi_id'              => isset($data['upi_id']) ? $data['upi_id'] : NULL,
            'updated_at'          => date('Y-m-d H:i:s'),
        );

        if ($existing) {
            $this->db->where('id', $existing->id);
            $this->db->update($this->table, $row);
            return $existing->id;
        } else {
            $row['is_verified'] = 0;
            $row['created_at'] = date('Y-m-d H:i:s');
            $this->db->insert($this->table, $row);
            return $this->db->insert_id();
        }
    }
}
