<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Commission_model extends CI_Model
{
    protected $table = 'commission_rules';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Calculate commission for a booking.
     *
     * @param int   $category_id  Service category
     * @param float $total_amount Booking total
     * @return array ['rate' => float, 'amount' => float]
     */
    public function calculate($category_id, $total_amount)
    {
        // Check if commission is enabled (Phase 4)
        $commission_enabled = $this->db->where('setting_key', 'commission_enabled')->get('settings')->row();
        if ( ! $commission_enabled || $commission_enabled->setting_value !== '1') {
            // Commission disabled — vendor gets full amount
            return array('rate' => 0, 'amount' => 0);
        }

        // Try category-specific rule first
        $rule = NULL;
        if ($category_id) {
            $rule = $this->db->where('category_id', $category_id)
                ->where('is_active', 1)
                ->get($this->table)
                ->row();
        }

        // Fall back to default rule (category_id IS NULL)
        if ( ! $rule) {
            $rule = $this->db->where('category_id IS NULL', NULL, FALSE)
                ->where('is_active', 1)
                ->get($this->table)
                ->row();
        }

        if ( ! $rule) {
            $rate = 15.00;
            $min = 0;
        } else {
            $rate = (float) $rule->commission_percentage;
            $min = (float) $rule->min_commission;
        }

        $amount = round($total_amount * $rate / 100, 2);

        if ($amount < $min) {
            $amount = $min;
        }

        return array('rate' => $rate, 'amount' => $amount);
    }

    /**
     * Get all commission rules (admin).
     */
    public function get_all()
    {
        return $this->db->select('cr.*, c.name AS category_name')
            ->from('commission_rules cr')
            ->join('categories c', 'c.id = cr.category_id', 'left')
            ->order_by('cr.category_id', 'ASC')
            ->get()
            ->result();
    }

    /**
     * Create or update a commission rule.
     */
    public function save($data)
    {
        $category_id = isset($data['category_id']) ? $data['category_id'] : NULL;

        // Check if rule exists for this category
        if ($category_id) {
            $existing = $this->db->where('category_id', $category_id)->get($this->table)->row();
        } else {
            $existing = $this->db->where('category_id IS NULL', NULL, FALSE)->get($this->table)->row();
        }

        $row = array(
            'category_id'          => $category_id,
            'commission_percentage' => $data['commission_percentage'],
            'min_commission'       => isset($data['min_commission']) ? $data['min_commission'] : 0,
            'is_active'            => isset($data['is_active']) ? $data['is_active'] : 1,
        );

        if ($existing) {
            $this->db->where('id', $existing->id);
            $this->db->update($this->table, $row);
            return $existing->id;
        } else {
            $row['created_at'] = date('Y-m-d H:i:s');
            $this->db->insert($this->table, $row);
            return $this->db->insert_id();
        }
    }

    /**
     * Delete a commission rule.
     */
    public function delete($id)
    {
        $this->db->where('id', $id);
        return $this->db->delete($this->table);
    }
}
