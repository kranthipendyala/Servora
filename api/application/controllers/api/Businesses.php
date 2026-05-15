<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Businesses extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Business_model');
        $this->load->library('Business_indexer', NULL, 'indexer');
    }

    /**
     * GET /api/businesses
     * Paginated listing with optional filters:
     *   ?city=<slug>&category=<slug>&locality=<slug>&sort=rating|name|newest
     *   &min_rating=<1-5>&verified=1&page=1&per_page=20
     */
    public function index()
    {
        $pagination = $this->_get_pagination();

        $sort = $this->input->get('sort') ?: 'default';

        // Filter set used by both ES and MySQL paths
        $filters = array(
            'city_slug'     => $this->input->get('city'),
            'category_slug' => $this->input->get('category'),
            'locality_slug' => $this->input->get('locality'),
            'min_rating'    => $this->input->get('min_rating'),
        );
        if ($this->input->get('verified')) {
            $filters['is_verified'] = TRUE;
        }
        $filters = array_filter($filters, function($v) {
            return $v !== NULL && $v !== '' && $v !== FALSE;
        });

        // Try Elasticsearch first
        $es = $this->indexer->list_search($filters, $sort, $pagination['per_page'], $pagination['offset']);

        if ($es !== NULL) {
            $businesses = $this->Business_model->hydrate_by_ids($es['ids']);
            $total      = $es['total'];
            $engine     = 'elasticsearch';
        } else {
            // MySQL fallback — translate the sort into the column form get_listing() expects
            $mysql_filters = $filters;
            switch ($sort) {
                case 'rating':   $mysql_filters['sort_by'] = 'b.avg_rating';    $mysql_filters['sort_dir'] = 'DESC'; break;
                case 'name':     $mysql_filters['sort_by'] = 'b.name';          $mysql_filters['sort_dir'] = 'ASC';  break;
                case 'newest':   $mysql_filters['sort_by'] = 'b.created_at';    $mysql_filters['sort_dir'] = 'DESC'; break;
                case 'reviews':  $mysql_filters['sort_by'] = 'b.total_reviews'; $mysql_filters['sort_dir'] = 'DESC'; break;
                default:         $mysql_filters['sort_by'] = 'default';         $mysql_filters['sort_dir'] = 'DESC'; break;
            }
            $result     = $this->Business_model->get_listing($mysql_filters, $pagination['per_page'], $pagination['offset']);
            $businesses = $result['businesses'];
            $total      = $result['total'];
            $engine     = 'mysql';
        }

        $this->respond(array(
            'engine'     => $engine,
            'businesses' => $businesses,
            'pagination' => array(
                'total'    => $total,
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => $total > 0 ? (int) ceil($total / $pagination['per_page']) : 0,
            ),
        ));
    }

    /**
     * GET /api/businesses/:slug
     * Point lookup — always read from MySQL.
     */
    public function show($slug)
    {
        $business = $this->Business_model->get_by_slug($slug);

        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        $this->respond($business);
    }
}
