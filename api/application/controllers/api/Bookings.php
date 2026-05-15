<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bookings extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Booking_model');
        $this->load->model('Service_model');
        $this->load->model('Notification_model');
    }

    /**
     * POST /api/bookings
     * Create a new booking.
     */
    public function create()
    {
        $this->_require_auth();

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('business_id', 'items', 'scheduled_date', 'scheduled_time'));

        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        if (empty($data['items']) || ! is_array($data['items'])) {
            $this->respond_error('At least one service item is required', 422);
        }

        // Load business to get vendor_id
        $this->load->model('Business_model');
        $business = $this->Business_model->get_by_id($data['business_id']);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        // Only approved businesses can accept bookings
        if ($business->status !== 'approved') {
            $this->respond_error('This business is not currently accepting bookings', 403);
        }

        // Build booking items and calculate totals
        $items = array();
        $subtotal = 0;
        $category_id = NULL;

        foreach ($data['items'] as $item) {
            if (empty($item['service_id'])) {
                $this->respond_error('Each item must have a service_id', 422);
            }

            $service = $this->Service_model->get_by_id($item['service_id']);
            if ( ! $service) {
                $this->respond_error('Service not found: ' . $item['service_id'], 404);
            }

            if ( ! $category_id) {
                $category_id = $service->category_id;
            }

            $quantity = isset($item['quantity']) ? (int) $item['quantity'] : 1;
            $variant = NULL;
            $variant_name = NULL;
            $unit_price = (float) ($service->discounted_price ?: $service->base_price);

            if ( ! empty($item['variant_id'])) {
                $variants = $this->Service_model->get_variants($service->id);
                foreach ($variants as $v) {
                    if ($v->id == $item['variant_id']) {
                        $variant = $v;
                        $variant_name = $v->name;
                        $unit_price = (float) $v->price;
                        break;
                    }
                }
            }

            $total_price = $unit_price * $quantity;
            $subtotal += $total_price;

            $items[] = array(
                'service_id'   => $service->id,
                'variant_id'   => $variant ? $variant->id : NULL,
                'service_name' => $service->name,
                'variant_name' => $variant_name,
                'quantity'     => $quantity,
                'unit_price'   => $unit_price,
                'total_price'  => $total_price,
            );
        }

        $discount = isset($data['discount_amount']) ? (float) $data['discount_amount'] : 0;
        $tax_rate = 18; // GST 18%

        // Phase-based platform fee (from admin settings)
        $platform_fee = 0;
        $platform_fee_enabled = $this->_get_setting('platform_fee_enabled');
        if ($platform_fee_enabled === '1') {
            $platform_fee = (float) ($this->_get_setting('platform_fee_amount') ?: 0);

            // Surge pricing for weekends/specific days
            $surge_enabled = $this->_get_setting('surge_pricing_enabled');
            if ($surge_enabled === '1') {
                $surge_days = strtolower($this->_get_setting('surge_days') ?: 'sunday');
                $booking_day = strtolower(date('l', strtotime($data['scheduled_date'])));
                if (strpos($surge_days, $booking_day) !== FALSE) {
                    $platform_fee += (float) ($this->_get_setting('surge_fee_amount') ?: 0);
                }
            }
        }

        $taxable = $subtotal - $discount;
        $tax = round($taxable * $tax_rate / 100, 2);
        $total = $taxable + $tax + $platform_fee;

        // Phase-based commission (only if enabled in admin settings)
        $commission_enabled = $this->_get_setting('commission_enabled');
        $override_category_id = ($commission_enabled === '1') ? $category_id : NULL;

        // Payment method — COD or online
        $payment_method = isset($data['payment_method']) ? $data['payment_method'] : NULL;
        $cod_enabled = $this->_get_setting('cod_enabled');
        $online_enabled = $this->_get_setting('online_payment_enabled');

        // Auto-select payment method based on phase settings
        if ( ! $payment_method) {
            if ($cod_enabled === '1' && $online_enabled !== '1') {
                $payment_method = 'cod'; // Phase 1: COD only
            } elseif ($online_enabled === '1' && $cod_enabled !== '1') {
                $payment_method = 'online'; // Online only
            }
            // If both enabled, customer must choose (sent from frontend)
        }

        $booking_data = array(
            'customer_id'      => $this->current_user->id,
            'vendor_id'        => $business->owner_user_id ?: 0,
            'business_id'      => $business->id,
            'category_id'      => $commission_enabled === '1' ? $category_id : NULL,
            'address_id'       => isset($data['address_id']) ? $data['address_id'] : NULL,
            'service_address'  => isset($data['service_address']) ? $data['service_address'] : NULL,
            'service_latitude' => isset($data['service_latitude']) ? $data['service_latitude'] : NULL,
            'service_longitude'=> isset($data['service_longitude']) ? $data['service_longitude'] : NULL,
            'scheduled_date'   => $data['scheduled_date'],
            'scheduled_time'   => $data['scheduled_time'],
            'subtotal'         => $subtotal,
            'discount_amount'  => $discount,
            'tax_amount'       => $tax,
            'platform_fee'     => $platform_fee,
            'total_amount'     => $total,
            'payment_method'   => $payment_method,
            'customer_notes'   => isset($data['customer_notes']) ? $data['customer_notes'] : NULL,
            'items'            => $items,
        );

        $booking = $this->Booking_model->create($booking_data);

        if ( ! $booking) {
            $this->respond_error('Failed to create booking', 500);
        }

        // For COD bookings, auto-confirm (no payment needed upfront)
        if ($payment_method === 'cod') {
            $this->Booking_model->update_payment_status($booking->id, 'cod');
        }

        // Notify vendor
        if ($booking->vendor_id) {
            $this->Notification_model->create(
                $booking->vendor_id,
                'booking_created',
                'New Booking Received',
                'Booking #' . $booking->booking_number . ' from ' . $this->current_user->full_name . ($payment_method === 'cod' ? ' (Pay after service)' : ''),
                array('booking_id' => $booking->id)
            );
        }

        $booking = $this->Booking_model->get_by_id($booking->id);
        $this->respond($booking, 201, 'Booking created successfully');
    }

    /**
     * GET /api/bookings
     * Get current user's bookings.
     */
    public function my_bookings()
    {
        $this->_require_auth();
        $pagination = $this->_get_pagination();
        $status = $this->input->get('status');

        $result = $this->Booking_model->get_by_customer(
            $this->current_user->id, $status,
            $pagination['per_page'], $pagination['offset']
        );

        $this->respond(array(
            'bookings'   => $result['bookings'],
            'pagination' => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
        ));
    }

    /**
     * GET /api/bookings/:id
     */
    public function show($id)
    {
        $this->_require_auth();

        $booking = $this->Booking_model->get_by_id($id);
        if ( ! $booking) {
            $this->respond_error('Booking not found', 404);
        }

        // Only allow customer, vendor, or admin to view
        if ($booking->customer_id != $this->current_user->id &&
            $booking->vendor_id != $this->current_user->id &&
            ! in_array($this->current_user->role, array('admin', 'super_admin'))) {
            $this->respond_error('Access denied', 403);
        }

        $this->respond($booking);
    }

    /**
     * POST /api/bookings/:id/cancel
     */
    public function cancel($id)
    {
        $this->_require_auth();

        $booking = $this->Booking_model->get_by_id($id);
        if ( ! $booking) {
            $this->respond_error('Booking not found', 404);
        }

        if ($booking->customer_id != $this->current_user->id) {
            $this->respond_error('Access denied', 403);
        }

        $data = $this->_get_json_body();

        $result = $this->Booking_model->update_status($id, 'cancelled', array(
            'cancellation_reason' => isset($data['reason']) ? $data['reason'] : 'Cancelled by customer',
            'cancelled_by'        => 'customer',
        ));

        if ( ! $result) {
            $this->respond_error('Cannot cancel this booking. Current status: ' . $booking->status, 400);
        }

        // Notify vendor
        if ($booking->vendor_id) {
            $this->Notification_model->create(
                $booking->vendor_id,
                'booking_cancelled',
                'Booking Cancelled',
                'Booking #' . $booking->booking_number . ' has been cancelled by customer',
                array('booking_id' => $booking->id)
            );
        }

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Booking cancelled');
    }

    /**
     * Get a setting value from settings table.
     */
    private function _get_setting($key)
    {
        $row = $this->db->where('setting_key', $key)->get('settings')->row();
        return $row ? $row->setting_value : NULL;
    }
}
