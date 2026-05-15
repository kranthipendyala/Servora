<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vendor_dashboard extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Booking_model');
        $this->load->model('Service_model');
        $this->load->model('Notification_model');
        $this->load->model('Vendor_availability_model');
    }

    /**
     * Require vendor or business_owner role.
     */
    private function _require_vendor()
    {
        $this->_require_role(array('vendor', 'business_owner'));
    }

    /**
     * Check if vendor's business is approved. Returns business or sends error.
     */
    private function _require_approved_vendor()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business profile found. Please complete onboarding.', 404);
        }
        if ($business->status !== 'approved') {
            $this->respond_error('Your business is under review. You will be notified once approved by admin.', 403);
        }
        return $business;
    }

    /**
     * GET /api/vendor/stats
     */
    public function stats()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        $is_approved = $business && $business->status === 'approved';

        $stats = $this->Booking_model->get_vendor_stats($this->current_user->id);
        $stats['business_status'] = $business ? $business->status : 'pending';
        $stats['is_approved'] = $is_approved;
        $stats['business_name'] = $business ? $business->name : NULL;
        $this->respond($stats);
    }

    /**
     * GET /api/vendor/bookings
     */
    public function pending_bookings()
    {
        $this->_require_vendor();
        $pagination = $this->_get_pagination();
        $status = $this->input->get('status');

        $result = $this->Booking_model->get_by_vendor(
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
     * POST /api/vendor/bookings/:id/accept
     */
    public function accept($id)
    {
        $this->_require_vendor();
        $booking = $this->_get_vendor_booking($id);

        $result = $this->Booking_model->update_status($id, 'confirmed');
        if ( ! $result) {
            $this->respond_error('Cannot accept this booking. Current status: ' . $booking->status, 400);
        }

        $this->Notification_model->create(
            $booking->customer_id,
            'booking_confirmed',
            'Booking Confirmed',
            'Your booking #' . $booking->booking_number . ' has been accepted',
            array('booking_id' => $id)
        );

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Booking accepted');
    }

    /**
     * POST /api/vendor/bookings/:id/reject
     */
    public function reject($id)
    {
        $this->_require_vendor();
        $booking = $this->_get_vendor_booking($id);
        $data = $this->_get_json_body();

        $result = $this->Booking_model->update_status($id, 'cancelled', array(
            'cancellation_reason' => isset($data['reason']) ? $data['reason'] : 'Rejected by vendor',
            'cancelled_by'        => 'vendor',
        ));

        if ( ! $result) {
            $this->respond_error('Cannot reject this booking', 400);
        }

        $this->Notification_model->create(
            $booking->customer_id,
            'booking_rejected',
            'Booking Rejected',
            'Your booking #' . $booking->booking_number . ' could not be accepted',
            array('booking_id' => $id)
        );

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Booking rejected');
    }

    /**
     * POST /api/vendor/bookings/:id/start
     */
    public function start($id)
    {
        $this->_require_vendor();
        $booking = $this->_get_vendor_booking($id);

        $result = $this->Booking_model->update_status($id, 'in_progress');
        if ( ! $result) {
            $this->respond_error('Cannot start this booking', 400);
        }

        $this->Notification_model->create(
            $booking->customer_id,
            'booking_started',
            'Service Started',
            'Service for booking #' . $booking->booking_number . ' has begun',
            array('booking_id' => $id)
        );

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Booking started');
    }

    /**
     * POST /api/vendor/bookings/:id/complete
     */
    public function complete($id)
    {
        $this->_require_vendor();
        $booking = $this->_get_vendor_booking($id);
        $data = $this->_get_json_body();

        $result = $this->Booking_model->update_status($id, 'completed', array(
            'vendor_notes' => isset($data['notes']) ? $data['notes'] : NULL,
        ));

        if ( ! $result) {
            $this->respond_error('Cannot complete this booking', 400);
        }

        $this->Notification_model->create(
            $booking->customer_id,
            'booking_completed',
            'Service Completed',
            'Service for booking #' . $booking->booking_number . ' is complete. Please leave a review!',
            array('booking_id' => $id)
        );

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Booking completed');
    }

    /**
     * POST /api/vendor/bookings/:id/collect-payment
     * Vendor marks COD payment as received.
     */
    public function collect_payment($id)
    {
        $this->_require_vendor();
        $booking = $this->_get_vendor_booking($id);

        if ($booking->status !== 'completed') {
            $this->respond_error('Job must be completed before collecting payment', 400);
        }

        if ($booking->payment_status === 'paid') {
            $this->respond_error('Payment already collected', 400);
        }

        $data = $this->_get_json_body();
        $method = isset($data['method']) ? $data['method'] : 'cash';

        $this->Booking_model->update_payment_status($id, 'paid', $method);

        $this->Notification_model->create(
            $booking->customer_id,
            'payment_collected',
            'Payment Confirmed',
            'Payment of Rs.' . $booking->total_amount . ' for booking #' . $booking->booking_number . ' has been confirmed.',
            array('booking_id' => $id)
        );

        $this->respond($this->Booking_model->get_by_id($id), 200, 'Payment collected successfully');
    }

    // ---- Services Management ----

    /**
     * GET /api/vendor/services
     */
    public function my_services()
    {
        $this->_require_vendor();

        // Get vendor's business
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business profile found. Please create one first.', 404);
        }

        $services = $this->Service_model->get_by_business($business->id, FALSE);
        $this->respond($services);
    }

    /**
     * POST /api/vendor/services
     */
    public function create_service()
    {
        $this->_require_vendor();

        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business profile found', 404);
        }

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('name', 'category_id', 'base_price'));

        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $data['business_id'] = $business->id;
        $service = $this->Service_model->create($data);

        if ( ! $service) {
            $this->respond_error('Failed to create service', 500);
        }

        $this->respond($service, 201, 'Service created');
    }

    /**
     * PUT /api/vendor/services/:id
     */
    public function update_service($id)
    {
        $this->_require_vendor();

        $business = $this->_get_vendor_business();
        if ( ! $business || ! $this->Service_model->belongs_to_business($id, $business->id)) {
            $this->respond_error('Service not found', 404);
        }

        $data = $this->_get_json_body();
        $this->Service_model->update($id, $data);

        $this->respond($this->Service_model->get_by_id($id), 200, 'Service updated');
    }

    /**
     * DELETE /api/vendor/services/:id
     */
    public function delete_service($id)
    {
        $this->_require_vendor();

        $business = $this->_get_vendor_business();
        if ( ! $business || ! $this->Service_model->belongs_to_business($id, $business->id)) {
            $this->respond_error('Service not found', 404);
        }

        $this->Service_model->delete($id);
        $this->respond(NULL, 200, 'Service deleted');
    }

    // ---- Availability ----

    /**
     * GET /api/vendor/availability
     */
    public function availability()
    {
        $this->_require_vendor();

        $schedule = $this->Vendor_availability_model->get_schedule($this->current_user->id);
        $blocked = $this->Vendor_availability_model->get_blocked_dates($this->current_user->id);

        $this->respond(array(
            'schedule'      => $schedule,
            'blocked_dates' => $blocked,
        ));
    }

    /**
     * PUT /api/vendor/availability
     */
    public function update_availability()
    {
        $this->_require_vendor();

        $data = $this->_get_json_body();

        if (isset($data['schedule']) && is_array($data['schedule'])) {
            $this->Vendor_availability_model->set_schedule($this->current_user->id, $data['schedule']);
        }

        if (isset($data['block_date'])) {
            $this->Vendor_availability_model->block_date(
                $this->current_user->id,
                $data['block_date'],
                isset($data['reason']) ? $data['reason'] : NULL
            );
        }

        if (isset($data['unblock_date'])) {
            $this->Vendor_availability_model->unblock_date($this->current_user->id, $data['unblock_date']);
        }

        $this->respond($this->Vendor_availability_model->get_schedule($this->current_user->id), 200, 'Availability updated');
    }

    // ---- Business Categories ----

    /**
     * GET /api/vendor/categories
     * Get vendor's business categories
     */
    public function my_categories()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        $this->load->model('Business_model');
        $cats = $this->Business_model->_get_business_categories($business->id);
        $this->respond($cats);
    }

    /**
     * POST /api/vendor/categories
     * Body: { category_ids: [1, 4, 8] }
     */
    public function update_categories()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        $data = $this->_get_json_body();
        if ( ! isset($data['category_ids']) || ! is_array($data['category_ids']) || empty($data['category_ids'])) {
            $this->respond_error('At least one category is required', 422);
        }

        $this->load->model('Business_model');
        $this->Business_model->_sync_categories($business->id, $data['category_ids']);

        $cats = $this->Business_model->_get_business_categories($business->id);
        $this->respond($cats, 200, 'Categories updated');
    }

    // ---- Service Areas ----

    /**
     * GET /api/vendor/service-areas
     */
    public function service_areas()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        $this->load->model('Business_model');
        $areas = $this->Business_model->_get_service_areas($business->id);
        $this->respond($areas);
    }

    /**
     * POST /api/vendor/service-areas
     * Body: { city_ids: [12, 37, 41] }
     */
    public function update_service_areas()
    {
        $this->_require_vendor();
        $business = $this->_get_vendor_business();
        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        $data = $this->_get_json_body();
        if ( ! isset($data['city_ids']) || ! is_array($data['city_ids'])) {
            $this->respond_error('city_ids array is required', 422);
        }

        // Always include home city
        $city_ids = array_unique(array_merge(array((int) $business->city_id), array_map('intval', $data['city_ids'])));

        $this->load->model('Business_model');
        $this->Business_model->sync_service_areas($business->id, $city_ids);

        $areas = $this->Business_model->_get_service_areas($business->id);
        $this->respond($areas, 200, 'Service areas updated');
    }

    // ---- Helpers ----

    private function _get_vendor_booking($id)
    {
        $booking = $this->Booking_model->get_by_id($id);
        if ( ! $booking || $booking->vendor_id != $this->current_user->id) {
            $this->respond_error('Booking not found', 404);
        }
        return $booking;
    }

    private function _get_vendor_business()
    {
        return $this->db->where('owner_user_id', $this->current_user->id)
            ->get('businesses')
            ->row();
    }
}
