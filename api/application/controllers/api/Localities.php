<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Localities extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Locality_model');
        $this->load->model('City_model');
    }

    /**
     * GET /api/localities/:city_slug
     */
    public function by_city($city_slug)
    {
        $city = $this->City_model->get_by_slug($city_slug);

        if ( ! $city) {
            $this->respond_error('City not found', 404);
        }

        $localities = $this->Locality_model->get_by_city($city->id);

        $this->respond(array(
            'city'       => array(
                'id'   => $city->id,
                'name' => $city->name,
                'slug' => $city->slug,
            ),
            'localities' => $localities,
        ));
    }
}
