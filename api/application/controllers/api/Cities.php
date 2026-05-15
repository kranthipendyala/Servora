<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cities extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('City_model');
    }

    /**
     * GET /api/cities
     * Optional: ?stats=1 to include business counts
     */
    public function index()
    {
        $with_stats = $this->input->get('stats');

        if ($with_stats) {
            $cities = $this->City_model->get_with_stats();
        } else {
            $cities = $this->City_model->get_all();
        }

        // Apply geo scope filter
        $geo = $this->_get_geo_scope();
        if ($geo === 'telangana') {
            $telangana_state = $this->db->where('slug', 'telangana')->get('states')->row();
            if ($telangana_state) {
                $cities = array_values(array_filter($cities, function($city) use ($telangana_state) {
                    return isset($city->state_id) && $city->state_id == $telangana_state->id;
                }));
            }
        }

        $this->respond(array('cities' => $cities));
    }

    private function _get_geo_scope()
    {
        $row = $this->db->where('setting_key', 'geo_scope')->get('settings')->row();
        return $row ? $row->setting_value : 'india';
    }

    /**
     * GET /api/cities/:slug
     */
    public function show($slug)
    {
        $city = $this->City_model->get_by_slug($slug);

        if ( ! $city) {
            $this->respond_error('City not found', 404);
        }

        // Load top categories for this city
        $this->load->model('Category_model');
        $city->top_categories = $this->Category_model->get_by_city($city->id);

        // Load localities
        $this->load->model('Locality_model');
        $city->localities = $this->Locality_model->get_by_city($city->id);

        $this->respond($city);
    }
}
