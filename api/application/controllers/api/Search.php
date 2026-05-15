<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Search extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Business_model');
        $this->load->library('Business_indexer', NULL, 'indexer');
    }

    /**
     * GET /api/search?q=<query>&city=<slug>&category=<slug>&page=1&per_page=20
     */
    public function index()
    {
        $query = trim($this->input->get('q'));

        if (empty($query)) {
            $this->respond_error('Search query is required. Use ?q=your+search+term', 422);
        }

        if (strlen($query) < 2) {
            $this->respond_error('Search query must be at least 2 characters', 422);
        }

        // Sanitize: strip anything that could break FULLTEXT boolean mode (also safer for LIKE fallback)
        $query = preg_replace('/[^\p{L}\p{N}\s\-]/u', '', $query);

        $pagination = $this->_get_pagination();
        $filters = array(
            'city_slug'     => $this->input->get('city'),
            'category_slug' => $this->input->get('category'),
        );
        $filters = array_filter($filters);

        // Try Elasticsearch first, fall back to MySQL on failure
        $es = $this->indexer->text_search($query, $filters, $pagination['per_page'], $pagination['offset']);

        if ($es !== NULL) {
            $payload = array(
                'businesses' => $this->Business_model->hydrate_by_ids($es['ids']),
                'total'      => $es['total'],
            );
            $engine = 'elasticsearch';
        } else {
            $payload = $this->Business_model->search($query, $filters, $pagination['per_page'], $pagination['offset']);
            $engine = 'mysql';
        }

        $this->respond(array(
            'query'      => $query,
            'engine'     => $engine,
            'businesses' => $payload['businesses'],
            'pagination' => array(
                'total'    => $payload['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => $payload['total'] > 0 ? (int) ceil($payload['total'] / $pagination['per_page']) : 0,
            ),
        ));
    }
}
