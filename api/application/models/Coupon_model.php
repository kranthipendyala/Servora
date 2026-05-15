<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Coupon_model extends CI_Model
{
    protected $table = 'coupons';

    public function __construct()
    {
        parent::__construct();
    }

    public function validate($code, $order_amount, $category_id = NULL, $user_id = NULL)
    {
        $coupon = $this->db->where('code', strtoupper(trim($code)))
            ->where('is_active', 1)
            ->get($this->table)->row();

        if ( ! $coupon) {
            return array('valid' => FALSE, 'message' => 'Invalid coupon code');
        }

        $now = date('Y-m-d H:i:s');
        if ($coupon->valid_from && $now < $coupon->valid_from) {
            return array('valid' => FALSE, 'message' => 'Coupon is not yet active');
        }
        if ($coupon->valid_until && $now > $coupon->valid_until) {
            return array('valid' => FALSE, 'message' => 'Coupon has expired');
        }
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return array('valid' => FALSE, 'message' => 'Coupon usage limit reached');
        }
        if ($order_amount < $coupon->min_order_amount) {
            return array('valid' => FALSE, 'message' => 'Minimum order amount is ₹' . $coupon->min_order_amount);
        }
        if ($coupon->category_id && $category_id && $coupon->category_id != $category_id) {
            return array('valid' => FALSE, 'message' => 'Coupon not valid for this category');
        }

        // Calculate discount
        if ($coupon->discount_type === 'percentage') {
            $discount = round($order_amount * $coupon->discount_value / 100, 2);
            if ($coupon->max_discount && $discount > $coupon->max_discount) {
                $discount = $coupon->max_discount;
            }
        } else {
            $discount = $coupon->discount_value;
        }

        return array(
            'valid'    => TRUE,
            'coupon'   => $coupon,
            'discount' => $discount,
            'message'  => 'Coupon applied! You save ₹' . $discount,
        );
    }

    public function use_coupon($coupon_id)
    {
        $this->db->where('id', $coupon_id);
        $this->db->set('used_count', 'used_count + 1', FALSE);
        return $this->db->update($this->table);
    }

    public function get_all($limit = 20, $offset = 0)
    {
        $total = $this->db->count_all($this->table);
        $coupons = $this->db->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get($this->table)->result();
        return array('coupons' => $coupons, 'total' => $total);
    }

    public function create($data)
    {
        $insert = array(
            'code'             => strtoupper(trim($data['code'])),
            'description'      => isset($data['description']) ? $data['description'] : NULL,
            'discount_type'    => isset($data['discount_type']) ? $data['discount_type'] : 'percentage',
            'discount_value'   => $data['discount_value'],
            'max_discount'     => isset($data['max_discount']) ? $data['max_discount'] : NULL,
            'min_order_amount' => isset($data['min_order_amount']) ? $data['min_order_amount'] : 0,
            'usage_limit'      => isset($data['usage_limit']) ? $data['usage_limit'] : NULL,
            'per_user_limit'   => isset($data['per_user_limit']) ? $data['per_user_limit'] : 1,
            'category_id'      => isset($data['category_id']) ? $data['category_id'] : NULL,
            'valid_from'       => isset($data['valid_from']) ? $data['valid_from'] : NULL,
            'valid_until'      => isset($data['valid_until']) ? $data['valid_until'] : NULL,
            'is_active'        => 1,
            'created_at'       => date('Y-m-d H:i:s'),
        );
        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    public function update($id, $data)
    {
        $allowed = array('code', 'description', 'discount_type', 'discount_value', 'max_discount',
            'min_order_amount', 'usage_limit', 'per_user_limit', 'category_id', 'valid_from', 'valid_until', 'is_active');
        $update = array();
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $update[$f] = $f === 'code' ? strtoupper(trim($data[$f])) : $data[$f];
            }
        }
        if (empty($update)) return FALSE;
        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    public function delete($id)
    {
        return $this->db->where('id', $id)->delete($this->table);
    }
}
