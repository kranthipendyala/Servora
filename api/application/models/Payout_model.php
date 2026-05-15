<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payout_model extends CI_Model
{
    protected $table = 'payouts';

    public function __construct()
    {
        parent::__construct();
    }

    public function create($data)
    {
        $insert = array(
            'vendor_id'        => $data['vendor_id'],
            'amount'           => $data['amount'],
            'status'           => 'pending',
            'payout_method'    => isset($data['payout_method']) ? $data['payout_method'] : 'bank_transfer',
            'period_start'     => isset($data['period_start']) ? $data['period_start'] : NULL,
            'period_end'       => isset($data['period_end']) ? $data['period_end'] : NULL,
            'bookings_count'   => isset($data['bookings_count']) ? $data['bookings_count'] : 0,
            'total_earnings'   => isset($data['total_earnings']) ? $data['total_earnings'] : 0,
            'total_commission' => isset($data['total_commission']) ? $data['total_commission'] : 0,
            'notes'            => isset($data['notes']) ? $data['notes'] : NULL,
            'created_at'       => date('Y-m-d H:i:s'),
            'updated_at'       => date('Y-m-d H:i:s'),
        );

        // Get vendor bank details
        $bank = $this->db->where('vendor_id', $data['vendor_id'])->get('vendor_bank_details')->row();
        if ($bank) {
            $insert['bank_details'] = json_encode(array(
                'account_holder' => $bank->account_holder_name,
                'account_number' => $bank->account_number,
                'ifsc'           => $bank->ifsc_code,
                'bank'           => $bank->bank_name,
                'upi'            => $bank->upi_id,
            ));
        }

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    public function get_by_id($id)
    {
        return $this->db->select('p.*, u.full_name AS vendor_name, u.email AS vendor_email')
            ->from('payouts p')
            ->join('users u', 'u.id = p.vendor_id')
            ->where('p.id', $id)
            ->get()->row();
    }

    public function get_by_vendor($vendor_id, $limit = 20, $offset = 0)
    {
        $total = $this->db->where('vendor_id', $vendor_id)->count_all_results($this->table);
        $payouts = $this->db->where('vendor_id', $vendor_id)
            ->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get($this->table)->result();
        return array('payouts' => $payouts, 'total' => $total);
    }

    public function get_all($status = NULL, $limit = 20, $offset = 0)
    {
        $this->db->select('p.*, u.full_name AS vendor_name, u.email AS vendor_email');
        $this->db->from('payouts p');
        $this->db->join('users u', 'u.id = p.vendor_id');
        if ($status) $this->db->where('p.status', $status);
        $this->db->order_by('p.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($limit, $offset);
        $payouts = $this->db->get()->result();

        return array('payouts' => $payouts, 'total' => $total);
    }

    public function process($id, $reference_id = NULL)
    {
        $this->db->where('id', $id);
        return $this->db->update($this->table, array(
            'status'       => 'completed',
            'reference_id' => $reference_id,
            'processed_at' => date('Y-m-d H:i:s'),
            'updated_at'   => date('Y-m-d H:i:s'),
        ));
    }

    public function mark_failed($id, $notes = NULL)
    {
        $this->db->where('id', $id);
        return $this->db->update($this->table, array(
            'status'     => 'failed',
            'notes'      => $notes,
            'updated_at' => date('Y-m-d H:i:s'),
        ));
    }
}
