<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reviews extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Review_model');
        $this->load->model('Business_model');
    }

    /**
     * GET /api/businesses/:slug/reviews
     */
    public function by_business($business_slug)
    {
        $business = $this->Business_model->get_by_slug($business_slug);

        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        $pagination = $this->_get_pagination();

        $result = $this->Review_model->get_by_business(
            $business->id,
            $pagination['per_page'],
            $pagination['offset']
        );

        $this->respond(array(
            'reviews'    => $result['reviews'],
            'pagination' => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
            'business'   => array(
                'id'         => $business->id,
                'name'       => $business->name,
                'avg_rating' => $business->avg_rating,
            ),
        ));
    }

    /**
     * POST /api/businesses/:slug/reviews
     * Requires authentication.
     */
    public function create($business_slug)
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->_require_auth();

        $business = $this->Business_model->get_by_slug($business_slug);

        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        $data = $this->_get_json_body();

        $missing = $this->_validate_required($data, array('rating'));
        if ( ! empty($missing)) {
            $this->respond_error('Rating is required', 422);
        }

        $rating = (int) $data['rating'];
        if ($rating < 1 || $rating > 5) {
            $this->respond_error('Rating must be between 1 and 5', 422);
        }

        $review_data = array(
            'business_id' => $business->id,
            'user_id'     => $this->current_user->id,
            'rating'      => $rating,
            'title'       => isset($data['title']) ? $data['title'] : '',
            'comment'     => isset($data['comment']) ? $data['comment'] : '',
        );

        $review_id = $this->Review_model->create($review_data);

        if ($review_id === FALSE) {
            $this->respond_error('You have already reviewed this business', 409);
        }

        $this->respond(
            array('review_id' => $review_id),
            201,
            'Review submitted successfully and is pending approval'
        );
    }
}
