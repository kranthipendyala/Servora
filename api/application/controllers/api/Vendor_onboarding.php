<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vendor_onboarding extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Vendor_document_model');
        $this->load->model('Vendor_bank_model');
    }

    private function _require_vendor()
    {
        $this->_require_role(array('vendor', 'business_owner'));
    }

    /** POST /api/vendor/documents */
    public function upload_document()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('document_type', 'document_url'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        }

        $id = $this->Vendor_document_model->upload($this->current_user->id, $data['document_type'], $data['document_url']);
        $this->respond(array('id' => $id), 201, 'Document uploaded');
    }

    /** GET /api/vendor/documents */
    public function my_documents()
    {
        $this->_require_vendor();
        $docs = $this->Vendor_document_model->get_by_vendor($this->current_user->id);
        $this->respond($docs);
    }

    /** GET /api/vendor/bank-details */
    public function bank_details()
    {
        $this->_require_vendor();
        $bank = $this->Vendor_bank_model->get_by_vendor($this->current_user->id);
        $this->respond($bank);
    }

    /** POST /api/vendor/bank-details */
    public function save_bank_details()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('account_holder_name', 'account_number', 'ifsc_code'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        }

        $id = $this->Vendor_bank_model->save($this->current_user->id, $data);
        $this->respond(array('id' => $id), 200, 'Bank details saved');
    }

    /** GET /api/vendor/payouts */
    public function payouts()
    {
        $this->_require_vendor();
        $this->load->model('Payout_model');
        $pagination = $this->_get_pagination();
        $result = $this->Payout_model->get_by_vendor($this->current_user->id, $pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }

    // ---- Onboarding step save endpoints ----

    /** POST /api/vendor/onboarding/business-profile */
    public function save_business_profile()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();
        $business = $this->db->where('owner_user_id', $this->current_user->id)->get('businesses')->row();
        if ( ! $business) {
            // Auto-create business for vendor if none exists
            $biz_name = isset($data['name']) ? $data['name'] : $this->current_user->full_name . ' Services';
            $biz_slug = url_title($biz_name, 'dash', TRUE) . '-' . $this->current_user->id;
            $this->db->insert('businesses', array(
                'name'          => $biz_name,
                'slug'          => $biz_slug,
                'city_id'       => isset($data['city_id']) ? $data['city_id'] : 12,
                'state_id'      => isset($data['state_id']) ? $data['state_id'] : 5,
                'owner_user_id' => $this->current_user->id,
                'status'        => 'pending',
                'is_active'     => 0,
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s'),
            ));
            $business = $this->db->where('owner_user_id', $this->current_user->id)->get('businesses')->row();
        }

        $update = array('updated_at' => date('Y-m-d H:i:s'));
        $fields = array('name', 'description', 'short_description', 'address', 'pin_code', 'phone', 'mobile', 'email', 'website', 'logo', 'cover_image');
        foreach ($fields as $f) {
            if (isset($data[$f])) $update[$f] = $data[$f];
        }
        if (isset($data['city_id'])) $update['city_id'] = $data['city_id'];
        if (isset($data['locality_id'])) $update['locality_id'] = $data['locality_id'];

        // business_hours must be valid JSON (column has CHECK constraint)
        if (isset($data['business_hours'])) {
            $bh = $data['business_hours'];
            if (is_string($bh)) {
                // Convert plain string like "Mon-Sat 09:00-18:00" to JSON
                $json_test = json_decode($bh);
                if ($json_test !== NULL) {
                    $update['business_hours'] = $bh; // Already valid JSON string
                } else {
                    // Convert to JSON object
                    $update['business_hours'] = json_encode(array('schedule' => $bh));
                }
            } elseif (is_array($bh)) {
                $update['business_hours'] = json_encode($bh);
            }
        }

        $this->db->where('id', $business->id)->update('businesses', $update);
        $this->respond(NULL, 200, 'Business profile saved');
    }

    /** POST /api/vendor/onboarding/services */
    public function save_services()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();
        $business = $this->db->where('owner_user_id', $this->current_user->id)->get('businesses')->row();
        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        if (empty($data['services']) || ! is_array($data['services'])) {
            $this->respond_error('At least one service is required', 422);
        }

        // Get business primary category as fallback
        $primary_cat = $this->db->where('business_id', $business->id)
            ->where('is_primary', 1)
            ->get('business_categories')->row();
        $default_cat_id = $primary_cat ? $primary_cat->category_id : 1;

        $this->load->model('Service_model');
        foreach ($data['services'] as $svc) {
            if (empty($svc['name'])) continue;

            // Resolve category — could be ID, name, or slug
            $cat_id = $default_cat_id;
            if ( ! empty($svc['category_id']) && is_numeric($svc['category_id'])) {
                $cat_id = (int) $svc['category_id'];
            } elseif ( ! empty($svc['category']) && is_numeric($svc['category'])) {
                $cat_id = (int) $svc['category'];
            } elseif ( ! empty($svc['category'])) {
                // Look up by name or slug
                $found = $this->db->group_start()
                    ->where('name', $svc['category'])
                    ->or_where('slug', url_title($svc['category'], 'dash', TRUE))
                    ->group_end()
                    ->get('categories')->row();
                if ($found) $cat_id = $found->id;
            }

            $this->Service_model->create(array(
                'business_id'      => $business->id,
                'category_id'      => $cat_id,
                'name'             => $svc['name'],
                'base_price'       => isset($svc['base_price']) ? $svc['base_price'] : 0,
                'duration_minutes' => isset($svc['duration']) ? (int) $svc['duration'] : 60,
            ));
        }

        $this->respond(NULL, 200, 'Services saved');
    }

    /** POST /api/vendor/onboarding/kyc-documents */
    public function save_kyc_documents()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();

        if (empty($data['documents']) || ! is_array($data['documents'])) {
            $this->respond_error('Documents are required', 422);
        }

        foreach ($data['documents'] as $doc) {
            if (empty($doc['type']) || empty($doc['url'])) continue;
            $this->Vendor_document_model->upload($this->current_user->id, $doc['type'], $doc['url']);
        }

        $this->respond(NULL, 200, 'Documents uploaded');
    }

    /** POST /api/vendor/onboarding/bank-details */
    public function save_bank_details_onboarding()
    {
        $this->_require_vendor();
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('account_holder_name', 'account_number', 'ifsc_code'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        }

        $this->Vendor_bank_model->save($this->current_user->id, $data);
        $this->respond(NULL, 200, 'Bank details saved');
    }

    /**
     * POST /api/vendor/register
     * Register a new vendor with phone + basic business info.
     */
    public function register_vendor()
    {
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('phone', 'name', 'business_name', 'city_id'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        // Check phone doesn't already exist
        $existing = $this->db->where('phone', $data['phone'])->get('users')->row();
        if ($existing) {
            $this->respond_error('An account already exists with this phone number', 409);
        }

        $token = bin2hex(random_bytes(32));
        $token_expiry = $this->config->item('api_token_expiry') ?: 2592000;

        // Create vendor user
        $this->db->insert('users', array(
            'full_name'            => $data['name'],
            'email'                => isset($data['email']) ? strtolower(trim($data['email'])) : NULL,
            'phone'                => $data['phone'],
            'phone_verified'       => 1,
            'password'             => NULL,
            'role'                 => 'vendor',
            'api_token'            => hash('sha256', $token),
            'token_expires_at'     => date('Y-m-d H:i:s', time() + $token_expiry),
            'is_active'            => 1,
            'onboarding_completed' => 0,
            'created_at'           => date('Y-m-d H:i:s'),
            'updated_at'           => date('Y-m-d H:i:s'),
        ));
        $vendor_id = $this->db->insert_id();

        if ( ! $vendor_id) {
            $this->respond_error('Failed to create vendor account', 500);
        }

        // Resolve state_id from city
        $state_id = NULL;
        if ( ! empty($data['city_id'])) {
            $city = $this->db->where('id', $data['city_id'])->get('cities')->row();
            if ($city) $state_id = $city->state_id;
        }

        // Create business entry with home city
        $biz_slug = url_title($data['business_name'], 'dash', TRUE) . '-' . $vendor_id;
        $this->db->insert('businesses', array(
            'name'          => $data['business_name'],
            'slug'          => $biz_slug,
            'city_id'       => $data['city_id'],
            'state_id'      => $state_id,
            'owner_user_id' => $vendor_id,
            'status'        => 'pending',
            'is_active'     => 0,
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ));
        $business_id = $this->db->insert_id();

        // Auto-add home city as first service area
        if ($business_id && ! empty($data['city_id'])) {
            $this->db->insert('business_service_areas', array(
                'business_id' => $business_id,
                'city_id'     => $data['city_id'],
                'is_active'   => 1,
            ));
        }

        $this->respond(array(
            'id'               => $vendor_id,
            'name'             => $data['name'],
            'phone'            => $data['phone'],
            'role'             => 'vendor',
            'business_id'      => $business_id,
            'token'            => $token,
            'token_expires_at' => date('Y-m-d H:i:s', time() + $token_expiry),
            'onboarding_completed' => FALSE,
        ), 201, 'Vendor account created. Please complete onboarding.');
    }

    /**
     * GET /api/vendor/onboarding/status
     * Check onboarding progress.
     */
    public function onboarding_status()
    {
        $this->_require_vendor();

        $vendor_id = $this->current_user->id;

        // Check business profile
        $business = $this->db->where('owner_user_id', $vendor_id)->get('businesses')->row();
        $profile_complete = $business && ! empty($business->description) && ! empty($business->address);

        // Check services
        $services_count = 0;
        if ($business) {
            $services_count = $this->db->where('business_id', $business->id)->count_all_results('services');
        }

        // Check documents
        $docs = $this->Vendor_document_model->get_by_vendor($vendor_id);
        $has_aadhaar = FALSE;
        $has_pan = FALSE;
        foreach ($docs as $doc) {
            if ($doc->document_type === 'aadhaar') $has_aadhaar = TRUE;
            if ($doc->document_type === 'pan') $has_pan = TRUE;
        }

        // Check bank details
        $bank = $this->Vendor_bank_model->get_by_vendor($vendor_id);

        // Check approval
        $approved = $business && $business->status === 'approved';

        $biz_data = NULL;
        $primary_category_id = NULL;
        if ($business) {
            // Get primary category from registration
            $primary_cat = $this->db->where('business_id', $business->id)
                ->where('is_primary', 1)
                ->get('business_categories')->row();
            $primary_category_id = $primary_cat ? (int) $primary_cat->category_id : NULL;

            $biz_data = array(
                'name'              => $business->name,
                'description'       => $business->description,
                'short_description' => $business->short_description,
                'address'           => $business->address,
                'pin_code'          => $business->pin_code,
                'phone'             => ! empty($business->phone) ? $business->phone : $this->current_user->phone,
                'email'             => ! empty($business->email) ? $business->email : $this->current_user->email,
                'website'           => $business->website,
                'logo'              => $business->logo,
                'business_hours'    => $business->business_hours,
                'primary_category_id' => $primary_category_id,
            );
        }

        $this->respond(array(
            'profile_complete'    => $profile_complete,
            'services_added'     => $services_count > 0,
            'services_count'     => $services_count,
            'documents_submitted'=> $has_aadhaar && $has_pan,
            'has_aadhaar'        => $has_aadhaar,
            'has_pan'            => $has_pan,
            'bank_added'         => $bank !== NULL,
            'approved'           => $approved,
            'business_status'    => $business ? $business->status : 'pending',
            'business_id'        => $business ? $business->id : NULL,
            'business'           => $biz_data,
        ));
    }

    /**
     * POST /api/vendor/onboarding/complete
     * Mark onboarding as complete and submit for review.
     */
    public function complete_onboarding()
    {
        $this->_require_vendor();

        $vendor_id = $this->current_user->id;
        $business = $this->db->where('owner_user_id', $vendor_id)->get('businesses')->row();

        if ( ! $business) {
            $this->respond_error('No business found', 404);
        }

        // Update user onboarding flag
        $this->db->where('id', $vendor_id)->update('users', array(
            'onboarding_completed' => 1,
            'updated_at'           => date('Y-m-d H:i:s'),
        ));

        // Set business to pending review
        $this->db->where('id', $business->id)->update('businesses', array(
            'status'     => 'pending',
            'updated_at' => date('Y-m-d H:i:s'),
        ));

        // Notify admin
        $this->load->model('Notification_model');
        $admins = $this->db->where_in('role', array('admin', 'super_admin'))->get('users')->result();
        foreach ($admins as $admin) {
            $this->Notification_model->create(
                $admin->id,
                'vendor_onboarding_complete',
                'New Vendor Ready for Review',
                $this->current_user->full_name . ' has completed onboarding for ' . $business->name,
                array('vendor_id' => $vendor_id, 'business_id' => $business->id)
            );
        }

        $this->respond(NULL, 200, 'Onboarding submitted for review. You will be notified once approved.');
    }
}
