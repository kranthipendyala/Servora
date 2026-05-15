<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Categories extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Category_model');
    }

    /**
     * GET /api/categories
     * Optional: ?city=<city_slug> to get categories with counts for a specific city
     *           ?tree=1 to get full category tree with children
     */
    public function index()
    {
        $city_slug = $this->input->get('city');
        $tree = $this->input->get('tree');

        if ($city_slug) {
            $this->load->model('City_model');
            $city = $this->City_model->get_by_slug($city_slug);
            if ( ! $city) {
                $this->respond_error('City not found', 404);
            }
            $categories = $this->Category_model->get_by_city($city->id);
            $this->respond(array('categories' => $categories, 'city' => $city->name));
        }

        if ($tree) {
            $categories = $this->Category_model->get_with_children();
        } else {
            $categories = $this->Category_model->get_all(TRUE);
        }

        $this->respond(array('categories' => $categories));
    }

    /**
     * GET /api/categories/:slug
     */
    public function show($slug)
    {
        $category = $this->Category_model->get_by_slug($slug);

        if ( ! $category) {
            $this->respond_error('Category not found', 404);
        }

        $this->respond($category);
    }
}
