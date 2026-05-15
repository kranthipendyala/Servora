<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Booking_model extends CI_Model
{
    protected $table = 'bookings';

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Commission_model');
    }

    /**
     * Create a new booking.
     */
    public function create($data)
    {
        $booking_number = $this->_generate_booking_number();

        // Calculate commission
        $commission = $this->Commission_model->calculate($data['category_id'], $data['total_amount']);

        $insert = array(
            'booking_number'      => $booking_number,
            'customer_id'         => $data['customer_id'],
            'vendor_id'           => $data['vendor_id'],
            'business_id'         => $data['business_id'],
            'address_id'          => isset($data['address_id']) ? $data['address_id'] : NULL,
            'service_address'     => isset($data['service_address']) ? $data['service_address'] : NULL,
            'service_latitude'    => isset($data['service_latitude']) ? $data['service_latitude'] : NULL,
            'service_longitude'   => isset($data['service_longitude']) ? $data['service_longitude'] : NULL,
            'scheduled_date'      => $data['scheduled_date'],
            'scheduled_time'      => $data['scheduled_time'],
            'status'              => 'pending',
            'subtotal'            => $data['subtotal'],
            'discount_amount'     => isset($data['discount_amount']) ? $data['discount_amount'] : 0,
            'tax_amount'          => isset($data['tax_amount']) ? $data['tax_amount'] : 0,
            'platform_fee'        => isset($data['platform_fee']) ? $data['platform_fee'] : 0,
            'total_amount'        => $data['total_amount'],
            'commission_rate'     => $commission['rate'],
            'commission_amount'   => $commission['amount'],
            'vendor_payout_amount'=> $data['total_amount'] - $commission['amount'] - (isset($data['platform_fee']) ? $data['platform_fee'] : 0),
            'payment_status'      => 'pending',
            'payment_method'      => isset($data['payment_method']) ? $data['payment_method'] : NULL,
            'customer_notes'      => isset($data['customer_notes']) ? $data['customer_notes'] : NULL,
            'created_at'          => date('Y-m-d H:i:s'),
            'updated_at'          => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        $booking_id = $this->db->insert_id();

        if ( ! $booking_id) {
            return FALSE;
        }

        // Insert booking items
        if ( ! empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $this->db->insert('booking_items', array(
                    'booking_id'   => $booking_id,
                    'service_id'   => $item['service_id'],
                    'variant_id'   => isset($item['variant_id']) ? $item['variant_id'] : NULL,
                    'service_name' => $item['service_name'],
                    'variant_name' => isset($item['variant_name']) ? $item['variant_name'] : NULL,
                    'quantity'     => isset($item['quantity']) ? $item['quantity'] : 1,
                    'unit_price'   => $item['unit_price'],
                    'total_price'  => $item['total_price'],
                ));
            }
        }

        return $this->get_by_id($booking_id);
    }

    /**
     * Get booking by ID with all related data.
     */
    public function get_by_id($id)
    {
        $this->db->select('
            b.*,
            cust.full_name AS customer_name, cust.phone AS customer_phone, cust.email AS customer_email,
            vend.full_name AS vendor_name, vend.phone AS vendor_phone,
            biz.name AS business_name, biz.slug AS business_slug
        ');
        $this->db->from('bookings b');
        $this->db->join('users cust', 'cust.id = b.customer_id', 'left');
        $this->db->join('users vend', 'vend.id = b.vendor_id', 'left');
        $this->db->join('businesses biz', 'biz.id = b.business_id', 'left');
        $this->db->where('b.id', $id);

        $booking = $this->db->get()->row();

        if ($booking) {
            $booking->items = $this->get_items($booking->id);
            $booking->address = $this->_get_address($booking->address_id);
        }

        return $booking;
    }

    /**
     * Get booking by booking number.
     */
    public function get_by_number($booking_number)
    {
        $row = $this->db->where('booking_number', $booking_number)->get($this->table)->row();
        if ($row) {
            return $this->get_by_id($row->id);
        }
        return NULL;
    }

    /**
     * Get bookings for a customer.
     */
    public function get_by_customer($customer_id, $status = NULL, $limit = 20, $offset = 0)
    {
        return $this->_get_bookings_list('customer_id', $customer_id, $status, $limit, $offset);
    }

    /**
     * Get bookings for a vendor.
     */
    public function get_by_vendor($vendor_id, $status = NULL, $limit = 20, $offset = 0)
    {
        return $this->_get_bookings_list('vendor_id', $vendor_id, $status, $limit, $offset);
    }

    /**
     * Get all bookings (admin).
     */
    public function get_all($status = NULL, $limit = 20, $offset = 0)
    {
        return $this->_get_bookings_list(NULL, NULL, $status, $limit, $offset);
    }

    /**
     * Update booking status with validation of allowed transitions.
     */
    public function update_status($id, $new_status, $extra = array())
    {
        $booking = $this->db->select('id, status')->where('id', $id)->get($this->table)->row();
        if ( ! $booking) {
            return FALSE;
        }

        $allowed_transitions = array(
            'pending'     => array('confirmed', 'cancelled'),
            'confirmed'   => array('assigned', 'in_progress', 'cancelled'),
            'assigned'    => array('in_progress', 'cancelled'),
            'in_progress' => array('completed', 'cancelled'),
            'completed'   => array('refunded'),
            'cancelled'   => array('refunded'),
        );

        $current = $booking->status;
        if ( ! isset($allowed_transitions[$current]) || ! in_array($new_status, $allowed_transitions[$current])) {
            return FALSE;
        }

        $update = array(
            'status'     => $new_status,
            'updated_at' => date('Y-m-d H:i:s'),
        );

        if ($new_status === 'in_progress') {
            $update['started_at'] = date('Y-m-d H:i:s');
        } elseif ($new_status === 'completed') {
            $update['completed_at'] = date('Y-m-d H:i:s');
        } elseif ($new_status === 'cancelled') {
            $update['cancelled_at'] = date('Y-m-d H:i:s');
            if (isset($extra['cancellation_reason'])) {
                $update['cancellation_reason'] = $extra['cancellation_reason'];
            }
            if (isset($extra['cancelled_by'])) {
                $update['cancelled_by'] = $extra['cancelled_by'];
            }
        }

        // Merge any extra fields
        if (isset($extra['vendor_notes'])) {
            $update['vendor_notes'] = $extra['vendor_notes'];
        }

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    /**
     * Update payment status.
     */
    public function update_payment_status($id, $payment_status, $payment_method = NULL)
    {
        $update = array(
            'payment_status' => $payment_status,
            'updated_at'     => date('Y-m-d H:i:s'),
        );

        if ($payment_method) {
            $update['payment_method'] = $payment_method;
        }

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    /**
     * Get booking items.
     */
    public function get_items($booking_id)
    {
        return $this->db->where('booking_id', $booking_id)
            ->get('booking_items')
            ->result();
    }

    /**
     * Get vendor stats.
     */
    public function get_vendor_stats($vendor_id)
    {
        $today = date('Y-m-d');

        $total = $this->db->where('vendor_id', $vendor_id)->count_all_results($this->table);

        $this->db->where('vendor_id', $vendor_id)->where('status', 'pending');
        $pending = $this->db->count_all_results($this->table);

        $this->db->where('vendor_id', $vendor_id)->where('status', 'completed');
        $completed = $this->db->count_all_results($this->table);

        $this->db->where('vendor_id', $vendor_id)->where('scheduled_date', $today)
            ->where_in('status', array('confirmed', 'assigned', 'in_progress'));
        $today_count = $this->db->count_all_results($this->table);

        $this->db->select_sum('vendor_payout_amount', 'total_earnings');
        $this->db->where('vendor_id', $vendor_id);
        $this->db->where('status', 'completed');
        $this->db->where('payment_status', 'paid');
        $earnings = $this->db->get($this->table)->row();

        return array(
            'total_bookings'  => $total,
            'pending'         => $pending,
            'completed'       => $completed,
            'today'           => $today_count,
            'total_earnings'  => $earnings ? (float) $earnings->total_earnings : 0,
        );
    }

    /**
     * Internal: get paginated booking list.
     */
    private function _get_bookings_list($field = NULL, $value = NULL, $status = NULL, $limit = 20, $offset = 0)
    {
        // Count
        if ($field) {
            $this->db->where($field, $value);
        }
        if ($status) {
            $this->db->where('status', $status);
        }
        $total = $this->db->count_all_results($this->table);

        // Fetch
        $this->db->select('
            b.*,
            cust.full_name AS customer_name,
            vend.full_name AS vendor_name,
            biz.name AS business_name
        ');
        $this->db->from('bookings b');
        $this->db->join('users cust', 'cust.id = b.customer_id', 'left');
        $this->db->join('users vend', 'vend.id = b.vendor_id', 'left');
        $this->db->join('businesses biz', 'biz.id = b.business_id', 'left');

        if ($field) {
            $this->db->where('b.' . $field, $value);
        }
        if ($status) {
            $this->db->where('b.status', $status);
        }

        $this->db->order_by('b.created_at', 'DESC');
        $this->db->limit($limit, $offset);

        $bookings = $this->db->get()->result();

        foreach ($bookings as &$booking) {
            $booking->items = $this->get_items($booking->id);
        }

        return array('bookings' => $bookings, 'total' => $total);
    }

    /**
     * Get address snapshot.
     */
    private function _get_address($address_id)
    {
        if ( ! $address_id) {
            return NULL;
        }

        return $this->db->where('id', $address_id)->get('addresses')->row();
    }

    /**
     * Generate unique booking number.
     */
    private function _generate_booking_number()
    {
        $prefix = 'BK-' . date('Ymd') . '-';
        $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        $number = $prefix . $random;

        // Ensure uniqueness
        while ($this->db->where('booking_number', $number)->count_all_results($this->table) > 0) {
            $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            $number = $prefix . $random;
        }

        return $number;
    }
}
