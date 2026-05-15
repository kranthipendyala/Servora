<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Leads extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Lead_model');
    }

    /**
     * POST /api/leads
     * Log a contact lead. Auth optional — captures user info if logged in.
     */
    public function create()
    {
        $data = $this->_get_json_body();

        if (empty($data['business_id']) || empty($data['contact_method'])) {
            $this->respond_error('business_id and contact_method are required', 422);
        }

        // Get business to find vendor
        $business = $this->db->where('id', $data['business_id'])->get('businesses')->row();
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        // Try to authenticate (optional)
        $this->_authenticate();

        $lead_data = array(
            'vendor_id'      => $business->owner_user_id ?: 0,
            'business_id'    => $business->id,
            'contact_method' => $data['contact_method'],
            'customer_name'  => isset($data['customer_name']) ? $data['customer_name'] : ($this->current_user ? $this->current_user->full_name : NULL),
            'customer_phone' => isset($data['customer_phone']) ? $data['customer_phone'] : ($this->current_user ? $this->current_user->phone : NULL),
            'customer_email' => isset($data['customer_email']) ? $data['customer_email'] : ($this->current_user ? $this->current_user->email : NULL),
            'customer_id'    => $this->current_user ? $this->current_user->id : NULL,
            'message'        => isset($data['message']) ? $data['message'] : NULL,
        );

        $lead_number = $this->Lead_model->create($lead_data);

        if ( ! $lead_number) {
            $this->respond_error('Failed to log lead', 500);
        }

        // Notify vendor
        $this->load->model('Notification_model');
        $method_label = $data['contact_method'] === 'call' ? 'called' : ($data['contact_method'] === 'whatsapp' ? 'messaged on WhatsApp' : 'sent an enquiry');
        $customer_label = $lead_data['customer_name'] ?: 'A customer';

        if ($business->owner_user_id) {
            $this->Notification_model->create(
                $business->owner_user_id,
                'new_lead',
                'New Lead Received',
                $customer_label . ' ' . $method_label . ' about ' . $business->name,
                array('lead_number' => $lead_number, 'business_id' => $business->id, 'contact_method' => $data['contact_method'])
            );
        }

        $this->respond(array(
            'lead_number' => $lead_number,
            'phone'       => $business->phone ?: $business->mobile,
        ), 201, 'Contact logged');
    }

    /**
     * GET /api/vendor/leads
     */
    public function vendor_leads()
    {
        $this->_require_role(array('vendor', 'business_owner'));
        $pagination = $this->_get_pagination();
        $result = $this->Lead_model->get_by_vendor($this->current_user->id, $pagination['per_page'], $pagination['offset']);
        $stats = $this->Lead_model->get_stats($this->current_user->id);
        $this->respond(array_merge($result, array('stats' => $stats)));
    }
}
