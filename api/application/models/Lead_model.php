<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lead_model extends CI_Model
{
    protected $table = 'leads';

    public function __construct()
    {
        parent::__construct();
    }

    public function create($data)
    {
        $lead_number = 'LD-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        while ($this->db->where('lead_number', $lead_number)->count_all_results($this->table) > 0) {
            $lead_number = 'LD-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        }

        // Check lead charge setting
        $lead_fee = 0;
        $charge_enabled = $this->db->query("SELECT setting_value FROM settings WHERE setting_key = 'lead_charge_enabled' LIMIT 1")->row();
        if ($charge_enabled && $charge_enabled->setting_value === '1') {
            $amount = $this->db->query("SELECT setting_value FROM settings WHERE setting_key = 'lead_charge_amount' LIMIT 1")->row();
            $lead_fee = $amount ? (float) $amount->setting_value : 0;
        }

        $insert = array(
            'lead_number'    => $lead_number,
            'customer_id'    => isset($data['customer_id']) ? $data['customer_id'] : NULL,
            'vendor_id'      => $data['vendor_id'],
            'business_id'    => $data['business_id'],
            'contact_method' => $data['contact_method'],
            'customer_name'  => isset($data['customer_name']) ? $data['customer_name'] : NULL,
            'customer_phone' => isset($data['customer_phone']) ? $data['customer_phone'] : NULL,
            'customer_email' => isset($data['customer_email']) ? $data['customer_email'] : NULL,
            'message'        => isset($data['message']) ? $data['message'] : NULL,
            'status'         => 'new',
            'lead_fee'       => $lead_fee,
            'created_at'     => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id() ? $lead_number : FALSE;
    }

    public function get_by_vendor($vendor_id, $limit = 20, $offset = 0)
    {
        $this->db->select('l.*, b.name AS business_name');
        $this->db->from('leads l');
        $this->db->join('businesses b', 'b.id = l.business_id', 'left');
        $this->db->where('l.vendor_id', $vendor_id);
        $this->db->order_by('l.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($limit, $offset);
        $leads = $this->db->get()->result();

        return array('leads' => $leads, 'total' => $total);
    }

    public function get_all($limit = 20, $offset = 0)
    {
        $this->db->select('l.*, b.name AS business_name, u.full_name AS vendor_name');
        $this->db->from('leads l');
        $this->db->join('businesses b', 'b.id = l.business_id', 'left');
        $this->db->join('users u', 'u.id = l.vendor_id', 'left');
        $this->db->order_by('l.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($limit, $offset);
        $leads = $this->db->get()->result();

        return array('leads' => $leads, 'total' => $total);
    }

    public function update_status($id, $status, $vendor_id = NULL)
    {
        if ($vendor_id) $this->db->where('vendor_id', $vendor_id);
        $this->db->where('id', $id);
        return $this->db->update($this->table, array('status' => $status, 'updated_at' => date('Y-m-d H:i:s')));
    }

    public function get_stats($vendor_id = NULL)
    {
        if ($vendor_id) $this->db->where('vendor_id', $vendor_id);
        $total = $this->db->count_all_results($this->table);

        if ($vendor_id) $this->db->where('vendor_id', $vendor_id);
        $this->db->where('status', 'new');
        $new_count = $this->db->count_all_results($this->table);

        if ($vendor_id) $this->db->where('vendor_id', $vendor_id);
        $this->db->where('status', 'converted');
        $converted = $this->db->count_all_results($this->table);

        return array('total' => $total, 'new' => $new_count, 'converted' => $converted, 'conversion_rate' => $total > 0 ? round(($converted / $total) * 100, 1) : 0);
    }
}
