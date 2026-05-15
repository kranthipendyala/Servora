<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Admin extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->_require_role(array('admin', 'super_admin'));
    }

    // -------------------------------------------------------------------------
    // Businesses
    // -------------------------------------------------------------------------

    public function business_detail($id)
    {
        $this->load->model('Business_model');
        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }
        $this->respond($business);
    }

    public function create_business()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }
        $this->load->model('Business_model');
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('name', 'city_id', 'state_id'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        }
        $id = $this->Business_model->create($data);
        $business = $this->Business_model->get_by_id($id);
        $this->respond($business, 201, 'Business created');
    }

    public function verify_business($id)
    {
        $this->load->model('Business_model');
        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) $this->respond_error('Business not found', 404);
        $new_val = $business->is_verified ? 0 : 1;
        $this->db->where('id', $id)->update('businesses', array('is_verified' => $new_val));
        $this->Business_model->reindex_to_es($id);
        $this->respond(array('is_verified' => $new_val), 200, 'Verification toggled');
    }

    public function feature_business($id)
    {
        $this->load->model('Business_model');
        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) $this->respond_error('Business not found', 404);
        $new_val = $business->is_featured ? 0 : 1;
        $this->db->where('id', $id)->update('businesses', array('is_featured' => $new_val));
        $this->Business_model->reindex_to_es($id);
        $this->respond(array('is_featured' => $new_val), 200, 'Featured toggled');
    }

    /**
     * GET /api/admin/businesses
     * List all businesses with optional status filter.
     */
    public function businesses()
    {
        $this->load->model('Business_model');
        $pagination = $this->_get_pagination();

        $filters = array('skip_geo' => TRUE);
        $status = $this->input->get('status');
        if ($status) {
            $filters['status'] = $status;
        } else {
            // Admin sees ALL businesses (pending, approved, rejected, suspended)
            $filters['status'] = 'all';
        }

        $result = $this->Business_model->get_listing($filters, $pagination['per_page'], $pagination['offset']);

        $this->respond(array(
            'businesses' => $result['businesses'],
            'pagination' => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
        ));
    }

    /**
     * POST /api/admin/businesses/backfill-states
     * One-time fix: populate state_id for businesses where it's missing or wrong.
     */
    public function backfill_business_states()
    {
        $this->load->model('Business_model');
        $count = $this->Business_model->backfill_state_ids();
        $this->respond(array('updated' => $count), 200, "Backfilled state_id for {$count} business(es)");
    }

    /**
     * PUT /api/admin/businesses/:id
     */
    public function update_business($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Business_model');

        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        $data = $this->_get_json_body();
        $this->Business_model->update($id, $data);

        $updated = $this->Business_model->get_by_id($id);
        $this->respond($updated, 200, 'Business updated successfully');
    }

    /**
     * DELETE /api/admin/businesses/:id
     */
    public function delete_business($id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Business_model');

        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        // Soft delete: set status to suspended
        $this->db->where('id', $id);
        $this->db->update('businesses', array(
            'status'     => 'suspended',
            'is_active'  => 0,
            'updated_at' => date('Y-m-d H:i:s'),
        ));

        // Suspended businesses are filtered out of search anyway, but reindex so the
        // is_active=false / status=suspended state lands in ES (in case future queries care).
        $this->Business_model->reindex_to_es($id);

        $this->respond(NULL, 200, 'Business suspended successfully');
    }

    /**
     * POST /api/admin/businesses/:id/approve
     */
    public function approve_business($id)
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Business_model');

        $business = $this->Business_model->get_by_id($id);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        // Direct DB update to ensure status is saved
        $this->db->where('id', $id)->update('businesses', array(
            'status'      => 'approved',
            'is_active'   => 1,
            'is_verified' => 1,
            'updated_at'  => date('Y-m-d H:i:s'),
        ));

        $this->Business_model->reindex_to_es($id);

        $this->respond(NULL, 200, 'Business approved and verified');
    }

    // -------------------------------------------------------------------------
    // Reviews
    // -------------------------------------------------------------------------

    /**
     * GET /api/admin/reviews
     * List all reviews with optional status filter.
     */
    public function reviews()
    {
        $this->load->model('Review_model');
        $pagination = $this->_get_pagination();

        $filters = array();
        $status = $this->input->get('status');
        if ($status) {
            $filters['status'] = $status;
        }

        $result = $this->Review_model->get_all($filters, $pagination['per_page'], $pagination['offset']);

        $this->respond(array(
            'reviews'    => $result['reviews'],
            'pagination' => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
        ));
    }

    /**
     * POST /api/admin/reviews/:id/approve
     */
    public function approve_review($id)
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Review_model');

        $result = $this->Review_model->approve($id);
        if ( ! $result) {
            $this->respond_error('Review not found', 404);
        }

        $this->respond(NULL, 200, 'Review approved');
    }

    /**
     * DELETE /api/admin/reviews/:id
     */
    public function delete_review($id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Review_model');

        $result = $this->Review_model->delete($id);
        if ( ! $result) {
            $this->respond_error('Review not found', 404);
        }

        $this->respond(NULL, 200, 'Review deleted');
    }

    // -------------------------------------------------------------------------
    // Users
    // -------------------------------------------------------------------------

    /**
     * GET /api/admin/users
     */
    public function users()
    {
        $this->load->model('User_model');
        $pagination = $this->_get_pagination();

        $filters = array();
        if ($this->input->get('role')) $filters['role'] = $this->input->get('role');
        if ($this->input->get('search')) $filters['search'] = $this->input->get('search');

        $result = $this->User_model->get_all($pagination['per_page'], $pagination['offset'], $filters);

        $this->respond(array(
            'users'      => $result['users'],
            'pagination' => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
        ));
    }

    /**
     * PUT /api/admin/users/:id
     */
    public function update_user($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('User_model');

        $user = $this->User_model->get_by_id($id);
        if ( ! $user) {
            $this->respond_error('User not found', 404);
        }

        $data = $this->_get_json_body();
        $this->User_model->update($id, $data);

        $updated = $this->User_model->get_by_id($id);
        $this->respond($updated, 200, 'User updated successfully');
    }

    // -------------------------------------------------------------------------
    // Categories
    // -------------------------------------------------------------------------

    public function categories()
    {
        // Return ALL categories (parents + children) for admin management
        $categories = $this->db->select('id, name, slug, icon, description, parent_id, sort_order, meta_title, meta_description, is_active')
            ->from('categories')
            ->order_by('parent_id', 'ASC')
            ->order_by('sort_order', 'ASC')
            ->order_by('name', 'ASC')
            ->get()->result();
        $this->respond($categories);
    }

    /**
     * POST /api/admin/categories
     */
    public function create_category()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Category_model');

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('name'));
        if ( ! empty($missing)) {
            $this->respond_error('Category name is required', 422);
        }

        $id = $this->Category_model->create($data);
        $category = $this->Category_model->get_by_id($id);

        $this->respond($category, 201, 'Category created');
    }

    /**
     * PUT /api/admin/categories/:id
     */
    public function update_category($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Category_model');

        $category = $this->Category_model->get_by_id($id);
        if ( ! $category) {
            $this->respond_error('Category not found', 404);
        }

        $data = $this->_get_json_body();
        $this->Category_model->update($id, $data);

        $updated = $this->Category_model->get_by_id($id);
        $this->respond($updated, 200, 'Category updated');
    }

    /**
     * DELETE /api/admin/categories/:id
     */
    public function delete_category($id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Category_model');

        $category = $this->Category_model->get_by_id($id);
        if ( ! $category) {
            $this->respond_error('Category not found', 404);
        }

        $this->Category_model->delete($id);
        $this->respond(NULL, 200, 'Category deleted');
    }

    // -------------------------------------------------------------------------
    // Cities & Localities
    // -------------------------------------------------------------------------

    public function cities()
    {
        $this->load->model('City_model');
        $cities = $this->City_model->get_with_stats();

        // Attach locality counts
        foreach ($cities as &$city) {
            $city->locality_count = (int) $this->db->where('city_id', $city->id)->count_all_results('localities');
        }

        $this->respond($cities);
    }

    public function localities()
    {
        $this->load->model('Locality_model');
        $city_id = $this->input->get('city_id');
        if ($city_id) {
            $localities = $this->Locality_model->get_by_city($city_id);
        } else {
            $localities = $this->db->order_by('name', 'ASC')->get('localities')->result();
        }
        $this->respond($localities);
    }

    public function create_locality()
    {
        if ($this->input->method(TRUE) !== 'POST') $this->respond_error('Method not allowed', 405);
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('name', 'city_id'));
        if ( ! empty($missing)) $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        if (empty($data['slug'])) $data['slug'] = url_title($data['name'], 'dash', TRUE);
        $this->db->insert('localities', $data);
        $id = $this->db->insert_id();
        $locality = $this->db->get_where('localities', array('id' => $id))->row();
        $this->respond($locality, 201, 'Locality created');
    }

    public function update_locality($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') $this->respond_error('Method not allowed', 405);
        $locality = $this->db->get_where('localities', array('id' => $id))->row();
        if ( ! $locality) $this->respond_error('Locality not found', 404);
        $data = $this->_get_json_body();
        $this->db->where('id', $id)->update('localities', $data);
        $updated = $this->db->get_where('localities', array('id' => $id))->row();
        $this->respond($updated, 200, 'Locality updated');
    }

    public function delete_locality($id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') $this->respond_error('Method not allowed', 405);
        $locality = $this->db->get_where('localities', array('id' => $id))->row();
        if ( ! $locality) $this->respond_error('Locality not found', 404);
        $this->db->where('id', $id)->delete('localities');
        $this->respond(NULL, 200, 'Locality deleted');
    }

    /**
     * POST /api/admin/cities
     */
    public function create_city()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('City_model');

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('name'));
        if ( ! empty($missing)) {
            $this->respond_error('City name is required', 422);
        }

        $id = $this->City_model->create($data);
        $city = $this->City_model->get_by_id($id);

        $this->respond($city, 201, 'City created');
    }

    /**
     * PUT /api/admin/cities/:id
     */
    public function update_city($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('City_model');

        $city = $this->City_model->get_by_id($id);
        if ( ! $city) {
            $this->respond_error('City not found', 404);
        }

        $data = $this->_get_json_body();
        $this->City_model->update($id, $data);

        $updated = $this->City_model->get_by_id($id);
        $this->respond($updated, 200, 'City updated');
    }

    // -------------------------------------------------------------------------
    // SEO
    // -------------------------------------------------------------------------

    /**
     * POST /api/admin/seo
     */
    public function save_seo()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->load->model('Seo_model');

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('page_type', 'meta_title'));
        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $this->Seo_model->save_meta($data);
        $this->respond(NULL, 200, 'SEO meta saved');
    }

    // -------------------------------------------------------------------------
    // Claims
    // -------------------------------------------------------------------------

    public function claims()
    {
        $pagination = $this->_get_pagination();
        $status = $this->input->get('status');

        $this->db->select('bc.*, b.name as business_name, b.slug as business_slug, u.full_name as user_name, u.email as user_email');
        $this->db->from('business_claims bc');
        $this->db->join('businesses b', 'b.id = bc.business_id', 'left');
        $this->db->join('users u', 'u.id = bc.user_id', 'left');
        if ($status) $this->db->where('bc.status', $status);
        $this->db->order_by('bc.created_at', 'DESC');
        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($pagination['per_page'], $pagination['offset']);
        $claims = $this->db->get()->result();

        $this->respond(array(
            'claims' => $claims,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    public function update_claim($id)
    {
        if ($this->input->method(TRUE) !== 'PUT') $this->respond_error('Method not allowed', 405);
        $claim = $this->db->get_where('business_claims', array('id' => $id))->row();
        if ( ! $claim) $this->respond_error('Claim not found', 404);
        $data = $this->_get_json_body();
        $update = array('status' => isset($data['status']) ? $data['status'] : $claim->status, 'reviewed_by' => $this->current_user->id);
        if (isset($data['notes'])) $update['notes'] = $data['notes'];
        $this->db->where('id', $id)->update('business_claims', $update);
        if (isset($data['status']) && $data['status'] === 'approved') {
            $this->db->where('id', $claim->business_id)->update('businesses', array('owner_user_id' => $claim->user_id, 'is_verified' => 1));
        }
        $this->respond(NULL, 200, 'Claim updated');
    }

    // -------------------------------------------------------------------------
    // SEO
    // -------------------------------------------------------------------------

    public function seo_list()
    {
        $pagination = $this->_get_pagination();
        $total = $this->db->count_all('seo_meta');
        $entries = $this->db->order_by('updated_at', 'DESC')
            ->limit($pagination['per_page'], $pagination['offset'])
            ->get('seo_meta')->result();
        $this->respond(array(
            'seo_entries' => $entries,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    public function delete_seo($id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') $this->respond_error('Method not allowed', 405);
        $this->db->where('id', $id)->delete('seo_meta');
        $this->respond(NULL, 200, 'SEO entry deleted');
    }

    // -------------------------------------------------------------------------
    // Settings
    // -------------------------------------------------------------------------

    public function settings()
    {
        $rows = $this->db->get('settings')->result();
        $settings = array();
        foreach ($rows as $row) {
            $settings[$row->setting_key] = $row->setting_value;
        }
        $this->respond($settings);
    }

    public function save_settings()
    {
        if ($this->input->method(TRUE) !== 'POST') $this->respond_error('Method not allowed', 405);
        $data = $this->_get_json_body();
        foreach ($data as $key => $value) {
            $exists = $this->db->get_where('settings', array('setting_key' => $key))->row();
            if ($exists) {
                $this->db->where('setting_key', $key)->update('settings', array('setting_value' => $value));
            } else {
                $this->db->insert('settings', array('setting_key' => $key, 'setting_value' => $value));
            }
        }
        $this->respond(NULL, 200, 'Settings saved');
    }

    // -------------------------------------------------------------------------
    // Users (create)
    // -------------------------------------------------------------------------

    public function create_user()
    {
        if ($this->input->method(TRUE) !== 'POST') $this->respond_error('Method not allowed', 405);
        $this->load->model('User_model');
        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('full_name', 'email', 'password'));
        if ( ! empty($missing)) $this->respond_error('Missing: ' . implode(', ', $missing), 422);
        $existing = $this->db->get_where('users', array('email' => $data['email']))->row();
        if ($existing) $this->respond_error('Email already exists', 422);
        $result = $this->User_model->register($data);
        if ( ! $result) $this->respond_error('Failed to create user', 500);
        $this->respond($result, 201, 'User created');
    }

    // -------------------------------------------------------------------------
    // Dashboard Stats
    // -------------------------------------------------------------------------

    /**
     * GET /api/admin/stats
     */
    public function dashboard_stats()
    {
        $total_businesses = $this->db->count_all('businesses');
        $active_businesses = $this->db->where('status', 'approved')->count_all_results('businesses');
        $pending_businesses = $this->db->where('status', 'pending')->count_all_results('businesses');
        $total_users = $this->db->count_all('users');
        $total_reviews = $this->db->count_all('reviews');
        $pending_reviews = $this->db->where('is_approved', 0)->count_all_results('reviews');
        $total_cities = $this->db->count_all('cities');
        $total_categories = $this->db->count_all('categories');

        $this->respond(array(
            'total_businesses'   => $total_businesses,
            'active_businesses'  => $active_businesses,
            'pending_businesses' => $pending_businesses,
            'total_users'        => $total_users,
            'total_reviews'      => $total_reviews,
            'pending_reviews'    => $pending_reviews,
            'total_cities'       => $total_cities,
            'total_categories'   => $total_categories,
        ));
    }

    // ================================================================
    //  MARKETPLACE ADMIN ENDPOINTS
    // ================================================================

    /** GET /api/admin/bookings */
    public function bookings()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $status = $this->input->get('status');
        $search = $this->input->get('search');

        $this->db->select('b.*, cust.full_name AS customer_name, vend.full_name AS vendor_name, biz.name AS business_name');
        $this->db->from('bookings b');
        $this->db->join('users cust', 'cust.id = b.customer_id', 'left');
        $this->db->join('users vend', 'vend.id = b.vendor_id', 'left');
        $this->db->join('businesses biz', 'biz.id = b.business_id', 'left');
        if ($status) $this->db->where('b.status', $status);
        if ($search) $this->db->like('b.booking_number', $search);
        $this->db->order_by('b.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($pagination['per_page'], $pagination['offset']);
        $bookings = $this->db->get()->result();

        $this->respond(array(
            'bookings' => $bookings,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    /** GET /api/admin/bookings/:id */
    public function booking_detail($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $this->load->model('Booking_model');
        $booking = $this->Booking_model->get_by_id($id);
        if (!$booking) $this->respond_error('Booking not found', 404);
        $this->respond($booking);
    }

    /** PUT /api/admin/bookings/:id/status */
    public function update_booking_status($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        if (empty($data['status'])) $this->respond_error('Status is required', 422);
        $this->load->model('Booking_model');
        $result = $this->Booking_model->update_status($id, $data['status'], array('cancelled_by' => 'admin'));
        if (!$result) $this->respond_error('Invalid status transition', 400);
        $this->respond($this->Booking_model->get_by_id($id));
    }

    /** GET /api/admin/commissions */
    public function commission_rules()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $this->load->model('Commission_model');
        $this->respond($this->Commission_model->get_all());
    }

    /** POST /api/admin/commissions */
    public function save_commission_rule()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        if (!isset($data['commission_percentage'])) $this->respond_error('commission_percentage required', 422);
        $this->load->model('Commission_model');
        $id = $this->Commission_model->save($data);
        $this->respond(array('id' => $id), 201);
    }

    /** PUT /api/admin/commissions/:id */
    public function update_commission_rule($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Commission_model');
        $this->Commission_model->save(array_merge($data, array('id' => $id)));
        $this->respond(NULL, 200, 'Commission rule updated');
    }

    /** DELETE /api/admin/commissions/:id */
    public function delete_commission_rule($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $this->load->model('Commission_model');
        $this->Commission_model->delete($id);
        $this->respond(NULL, 200, 'Commission rule deleted');
    }

    /** GET /api/admin/services */
    public function all_services()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();

        $this->db->select('s.*, b.name AS business_name, c.name AS category_name, c.slug AS category_slug');
        $this->db->from('services s');
        $this->db->join('businesses b', 'b.id = s.business_id', 'left');
        $this->db->join('categories c', 'c.id = s.category_id', 'left');

        // Filters
        $search = $this->input->get('search');
        if ($search) {
            $this->db->group_start();
            $this->db->like('s.name', $search);
            $this->db->or_like('b.name', $search);
            $this->db->group_end();
        }

        $category = $this->input->get('category');
        if ($category) {
            $this->db->where('c.slug', $category);
        }

        $status = $this->input->get('status');
        if ($status === 'active') {
            $this->db->where('s.is_active', 1);
        } elseif ($status === 'inactive') {
            $this->db->where('s.is_active', 0);
        }

        $this->db->order_by('s.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($pagination['per_page'], $pagination['offset']);
        $services = $this->db->get()->result();

        $this->respond(array(
            'services' => $services,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    /** GET /api/admin/subscription-plans */
    public function subscription_plans()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $plans = $this->db->order_by('sort_order', 'ASC')->get('subscription_plans')->result();
        foreach ($plans as &$p) { if ($p->features) $p->features = json_decode($p->features); }
        $this->respond($plans);
    }

    /** POST /api/admin/subscription-plans */
    public function create_subscription_plan()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Subscription_model');
        $id = $this->Subscription_model->create_plan($data);
        $this->respond(array('id' => $id), 201);
    }

    /** PUT /api/admin/subscription-plans/:id */
    public function update_subscription_plan($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Subscription_model');
        $this->Subscription_model->update_plan($id, $data);
        $this->respond(NULL, 200, 'Plan updated');
    }

    /** GET /api/admin/vendor-subscriptions */
    public function vendor_subscriptions()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $this->load->model('Subscription_model');
        $result = $this->Subscription_model->get_all_subscriptions($this->input->get('status'), $pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }

    /** GET /api/admin/payouts */
    public function payouts()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $this->load->model('Payout_model');
        $result = $this->Payout_model->get_all($this->input->get('status'), $pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }

    /** POST /api/admin/payouts/:id/process */
    public function process_payout($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Payout_model');
        $ref = isset($data['reference_id']) ? $data['reference_id'] : NULL;
        $this->Payout_model->process($id, $ref);
        $this->respond(NULL, 200, 'Payout processed');
    }

    /** GET /api/admin/vendor-documents */
    public function vendor_documents()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $this->load->model('Vendor_document_model');
        $result = $this->Vendor_document_model->get_all_pending($pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }

    /** POST /api/admin/vendor-documents/:id/approve */
    public function approve_vendor_document($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $this->load->model('Vendor_document_model');
        $this->Vendor_document_model->approve($id, $this->current_user->id);
        $this->respond(NULL, 200, 'Document approved');
    }

    /** POST /api/admin/vendor-documents/:id/reject */
    public function reject_vendor_document($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Vendor_document_model');
        $reason = isset($data['reason']) ? $data['reason'] : NULL;
        $this->Vendor_document_model->reject($id, $this->current_user->id, $reason);
        $this->respond(NULL, 200, 'Document rejected');
    }

    /** GET /api/admin/coupons */
    public function coupons()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $this->load->model('Coupon_model');
        $result = $this->Coupon_model->get_all($pagination['per_page'], $pagination['offset']);
        $this->respond($result);
    }

    /** POST /api/admin/coupons */
    public function create_coupon()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        if (empty($data['code']) || !isset($data['discount_value'])) $this->respond_error('Code and discount_value required', 422);
        $this->load->model('Coupon_model');
        $id = $this->Coupon_model->create($data);
        $this->respond(array('id' => $id), 201);
    }

    /** PUT /api/admin/coupons/:id */
    public function update_coupon($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $data = $this->_get_json_body();
        $this->load->model('Coupon_model');
        $this->Coupon_model->update($id, $data);
        $this->respond(NULL, 200, 'Coupon updated');
    }

    /** DELETE /api/admin/coupons/:id */
    public function delete_coupon($id)
    {
        $this->_require_role(array('admin', 'super_admin'));
        $this->load->model('Coupon_model');
        $this->Coupon_model->delete($id);
        $this->respond(NULL, 200, 'Coupon deleted');
    }

    /** GET /api/admin/analytics/revenue */
    public function analytics_revenue()
    {
        $this->_require_role(array('admin', 'super_admin'));

        // Total revenue
        $rev = $this->db->select_sum('total_amount', 'total_revenue')
            ->select_sum('commission_amount', 'total_commission')
            ->select_sum('vendor_payout_amount', 'total_payouts')
            ->where('status', 'completed')->where('payment_status', 'paid')
            ->get('bookings')->row();

        // Revenue by month (last 12 months)
        $monthly = $this->db->query("
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                   SUM(total_amount) AS revenue,
                   SUM(commission_amount) AS commission,
                   SUM(vendor_payout_amount) AS payouts,
                   COUNT(*) AS bookings
            FROM bookings WHERE status = 'completed' AND payment_status = 'paid'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ")->result();

        // Top vendors
        $top_vendors = $this->db->query("
            SELECT b.vendor_id, u.full_name AS vendor_name,
                   SUM(b.total_amount) AS revenue, COUNT(*) AS bookings
            FROM bookings b JOIN users u ON u.id = b.vendor_id
            WHERE b.status = 'completed'
            GROUP BY b.vendor_id ORDER BY revenue DESC LIMIT 10
        ")->result();

        // Bookings by status
        $by_status = $this->db->query("
            SELECT status, COUNT(*) AS count FROM bookings GROUP BY status
        ")->result();

        // Category performance
        $categories = $this->db->query("
            SELECT c.id AS category_id, c.name AS category_name,
                   COUNT(DISTINCT b.id) AS bookings, COALESCE(SUM(b.total_amount),0) AS revenue
            FROM bookings b
            JOIN booking_items bi ON bi.booking_id = b.id
            JOIN services s ON s.id = bi.service_id
            JOIN categories c ON c.id = s.category_id
            WHERE b.status = 'completed'
            GROUP BY c.id ORDER BY revenue DESC LIMIT 10
        ")->result();

        $this->respond(array(
            'total_revenue'       => $rev ? (float) $rev->total_revenue : 0,
            'total_commission'    => $rev ? (float) $rev->total_commission : 0,
            'total_payouts'       => $rev ? (float) $rev->total_payouts : 0,
            'revenue_by_month'    => $monthly,
            'top_vendors'         => $top_vendors,
            'bookings_by_status'  => $by_status,
            'category_performance'=> $categories,
        ));
    }

    /** GET /api/admin/analytics/bookings */
    public function analytics_bookings()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $by_status = $this->db->query("SELECT status, COUNT(*) AS count FROM bookings GROUP BY status")->result();
        $this->respond(array('bookings_by_status' => $by_status));
    }

    /** GET /api/admin/analytics/vendors */
    public function analytics_vendors()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $top = $this->db->query("
            SELECT b.vendor_id, u.full_name AS vendor_name,
                   SUM(b.total_amount) AS revenue, COUNT(*) AS bookings
            FROM bookings b JOIN users u ON u.id = b.vendor_id
            WHERE b.status = 'completed'
            GROUP BY b.vendor_id ORDER BY revenue DESC LIMIT 10
        ")->result();
        $this->respond(array('top_vendors' => $top));
    }

    /** GET /api/admin/login-logs */
    public function login_logs()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $event = $this->input->get('event_type');

        $this->db->select('l.*, u.full_name AS user_name');
        $this->db->from('user_login_logs l');
        $this->db->join('users u', 'u.id = l.user_id', 'left');
        if ($event) $this->db->where('l.event_type', $event);
        $this->db->order_by('l.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($pagination['per_page'], $pagination['offset']);
        $logs = $this->db->get()->result();

        $this->respond(array(
            'logs' => $logs,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    /** GET /api/admin/otp-logs */
    public function otp_logs()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $phone = $this->input->get('phone');

        $this->db->select('o.*, u.full_name AS user_name, u.email AS user_email, u.role AS user_role');
        $this->db->from('otp_verifications o');
        $this->db->join('users u', 'u.phone = o.phone', 'left');
        if ($phone) $this->db->like('o.phone', $phone);
        $this->db->order_by('o.created_at', 'DESC');

        $total = $this->db->count_all_results('', FALSE);
        $this->db->limit($pagination['per_page'], $pagination['offset']);
        $otps = $this->db->get()->result();

        $this->respond(array(
            'otps' => $otps,
            'pagination' => array('total' => $total, 'page' => $pagination['page'], 'per_page' => $pagination['per_page'], 'pages' => ceil($total / $pagination['per_page'])),
        ));
    }

    /** GET /api/admin/leads */
    public function all_leads()
    {
        $this->_require_role(array('admin', 'super_admin'));
        $pagination = $this->_get_pagination();
        $this->load->model('Lead_model');
        $result = $this->Lead_model->get_all($pagination['per_page'], $pagination['offset']);
        $stats = $this->Lead_model->get_stats();
        $this->respond(array_merge($result, array('stats' => $stats)));
    }
}
