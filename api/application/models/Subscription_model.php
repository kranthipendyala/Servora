<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Subscription_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    // ---- Plans ----

    public function get_plans($active_only = TRUE)
    {
        if ($active_only) {
            $this->db->where('is_active', 1);
        }
        return $this->db->order_by('sort_order', 'ASC')->get('subscription_plans')->result();
    }

    public function get_plan($id)
    {
        return $this->db->where('id', $id)->get('subscription_plans')->row();
    }

    public function create_plan($data)
    {
        $insert = array(
            'name'                   => $data['name'],
            'slug'                   => url_title($data['name'], 'dash', TRUE),
            'description'            => isset($data['description']) ? $data['description'] : NULL,
            'monthly_price'          => $data['monthly_price'],
            'annual_price'           => isset($data['annual_price']) ? $data['annual_price'] : NULL,
            'features'               => isset($data['features']) ? json_encode($data['features']) : NULL,
            'max_services'           => isset($data['max_services']) ? $data['max_services'] : 5,
            'max_bookings_per_month' => isset($data['max_bookings_per_month']) ? $data['max_bookings_per_month'] : 50,
            'commission_discount'    => isset($data['commission_discount']) ? $data['commission_discount'] : 0,
            'is_featured'            => isset($data['is_featured']) ? $data['is_featured'] : 0,
            'priority_in_search'     => isset($data['priority_in_search']) ? $data['priority_in_search'] : 0,
            'sort_order'             => isset($data['sort_order']) ? $data['sort_order'] : 0,
            'is_active'              => 1,
            'created_at'             => date('Y-m-d H:i:s'),
        );
        $this->db->insert('subscription_plans', $insert);
        return $this->db->insert_id();
    }

    public function update_plan($id, $data)
    {
        $allowed = array('name', 'description', 'monthly_price', 'annual_price', 'features',
            'max_services', 'max_bookings_per_month', 'commission_discount', 'is_featured',
            'priority_in_search', 'sort_order', 'is_active');
        $update = array();
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $field === 'features' ? json_encode($data[$field]) : $data[$field];
            }
        }
        if (empty($update)) return FALSE;
        $update['updated_at'] = date('Y-m-d H:i:s');
        $this->db->where('id', $id);
        return $this->db->update('subscription_plans', $update);
    }

    // ---- Vendor Subscriptions ----

    public function get_active_subscription($vendor_id)
    {
        return $this->db->select('vs.*, sp.name AS plan_name, sp.slug AS plan_slug, sp.features, sp.max_services, sp.max_bookings_per_month, sp.commission_discount')
            ->from('vendor_subscriptions vs')
            ->join('subscription_plans sp', 'sp.id = vs.plan_id')
            ->where('vs.vendor_id', $vendor_id)
            ->where_in('vs.status', array('active', 'trialing'))
            ->order_by('vs.created_at', 'DESC')
            ->get()->row();
    }

    public function subscribe($vendor_id, $plan_id, $billing_cycle = 'monthly', $razorpay_sub_id = NULL)
    {
        $plan = $this->get_plan($plan_id);
        if ( ! $plan) return FALSE;

        // Cancel any existing active subscription
        $this->db->where('vendor_id', $vendor_id)
            ->where_in('status', array('active', 'trialing'))
            ->update('vendor_subscriptions', array(
                'status' => 'cancelled',
                'cancelled_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ));

        $trial_days = $this->_get_setting('vendor_trial_days') ?: 30;
        $now = date('Y-m-d');

        $insert = array(
            'vendor_id'               => $vendor_id,
            'plan_id'                 => $plan_id,
            'razorpay_subscription_id'=> $razorpay_sub_id,
            'status'                  => $razorpay_sub_id ? 'active' : 'trialing',
            'billing_cycle'           => $billing_cycle,
            'current_period_start'    => $now,
            'current_period_end'      => $billing_cycle === 'annual'
                ? date('Y-m-d', strtotime('+1 year'))
                : date('Y-m-d', strtotime('+1 month')),
            'trial_ends_at'           => $razorpay_sub_id ? NULL : date('Y-m-d', strtotime("+{$trial_days} days")),
            'created_at'              => date('Y-m-d H:i:s'),
            'updated_at'              => date('Y-m-d H:i:s'),
        );

        $this->db->insert('vendor_subscriptions', $insert);
        return $this->db->insert_id();
    }

    public function cancel_subscription($vendor_id)
    {
        $this->db->where('vendor_id', $vendor_id)
            ->where_in('status', array('active', 'trialing'))
            ->update('vendor_subscriptions', array(
                'status' => 'cancelled',
                'cancelled_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ));
        return TRUE;
    }

    public function get_all_subscriptions($status = NULL, $limit = 20, $offset = 0)
    {
        $this->db->select('vs.*, sp.name AS plan_name, u.full_name AS vendor_name, u.email AS vendor_email');
        $this->db->from('vendor_subscriptions vs');
        $this->db->join('subscription_plans sp', 'sp.id = vs.plan_id');
        $this->db->join('users u', 'u.id = vs.vendor_id');
        if ($status) $this->db->where('vs.status', $status);
        $this->db->order_by('vs.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($limit, $offset);
        $subs = $this->db->get()->result();

        return array('subscriptions' => $subs, 'total' => $total);
    }

    private function _get_setting($key)
    {
        $row = $this->db->where('setting_key', $key)->get('settings')->row();
        return $row ? $row->setting_value : NULL;
    }
}
