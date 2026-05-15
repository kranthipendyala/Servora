<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Services extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Service_model');
    }

    /**
     * GET /api/services
     * List services with optional filters: business_id, category_id
     */
    public function index()
    {
        $pagination = $this->_get_pagination();

        $category_id = $this->input->get('category_id');
        $business_id = $this->input->get('business_id');

        if ($business_id) {
            $services = $this->Service_model->get_by_business($business_id);
            $this->respond($services);
        } elseif ($category_id) {
            $services = $this->Service_model->get_by_category($category_id, $pagination['per_page'], $pagination['offset']);
            $this->respond($services);
        } else {
            $this->respond_error('Please provide business_id or category_id', 400);
        }
    }

    /**
     * GET /api/services/:id
     */
    public function show($id)
    {
        $service = $this->Service_model->get_by_id($id);
        if ( ! $service) {
            $this->respond_error('Service not found', 404);
        }
        $this->respond($service);
    }

    /**
     * GET /api/businesses/:slug/services
     */
    public function by_business($slug)
    {
        $this->load->model('Business_model');
        $business = $this->Business_model->get_by_slug($slug);

        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        $services = $this->Service_model->get_by_business($business->id);
        $this->respond(array(
            'business' => array(
                'id'   => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
            ),
            'services' => $services,
        ));
    }
}
