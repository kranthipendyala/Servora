<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vendor_document_model extends CI_Model
{
    protected $table = 'vendor_documents';

    public function __construct()
    {
        parent::__construct();
    }

    public function upload($vendor_id, $document_type, $document_url)
    {
        $this->db->insert($this->table, array(
            'vendor_id'     => $vendor_id,
            'document_type' => $document_type,
            'document_url'  => $document_url,
            'status'        => 'pending',
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ));
        return $this->db->insert_id();
    }

    public function get_by_vendor($vendor_id)
    {
        return $this->db->where('vendor_id', $vendor_id)
            ->order_by('created_at', 'DESC')
            ->get($this->table)->result();
    }

    public function get_all_pending($limit = 20, $offset = 0)
    {
        $total = $this->db->where('status', 'pending')->count_all_results($this->table);

        $docs = $this->db->select('vd.*, u.full_name AS vendor_name, u.email AS vendor_email')
            ->from('vendor_documents vd')
            ->join('users u', 'u.id = vd.vendor_id')
            ->where('vd.status', 'pending')
            ->order_by('vd.created_at', 'ASC')
            ->limit($limit, $offset)
            ->get()->result();

        return array('documents' => $docs, 'total' => $total);
    }

    public function approve($id, $admin_id)
    {
        $this->db->where('id', $id);
        return $this->db->update($this->table, array(
            'status'      => 'approved',
            'reviewed_by' => $admin_id,
            'updated_at'  => date('Y-m-d H:i:s'),
        ));
    }

    public function reject($id, $admin_id, $reason = NULL)
    {
        $this->db->where('id', $id);
        return $this->db->update($this->table, array(
            'status'           => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by'      => $admin_id,
            'updated_at'       => date('Y-m-d H:i:s'),
        ));
    }
}
