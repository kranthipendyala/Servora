<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Business_model');
        $this->load->model('Review_model');
    }

    /**
     * GET /api/dashboard/business
     * Get the authenticated user's businesses.
     */
    public function my_business()
    {
        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $businesses = $this->Business_model->get_by_user($this->current_user->id);

        $this->respond(array('businesses' => $businesses));
    }

    /**
     * PUT /api/dashboard/business
     * Update the authenticated user's business.
     */
    public function update_business()
    {
        if ($this->input->method(TRUE) !== 'PUT') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $data = $this->_get_json_body();

        if (empty($data['business_id'])) {
            $this->respond_error('business_id is required', 422);
        }

        // Verify ownership
        $business = $this->Business_model->get_by_id($data['business_id']);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        if ($business->owner_user_id != $this->current_user->id && $this->current_user->role !== 'admin') {
            $this->respond_error('You do not own this business', 403);
        }

        // Owners cannot change status or verification
        if ($this->current_user->role !== 'admin') {
            unset($data['status'], $data['is_verified']);
        }

        $this->Business_model->update($data['business_id'], $data);

        $updated = $this->Business_model->get_by_id($data['business_id']);
        $this->respond($updated, 200, 'Business updated successfully');
    }

    /**
     * POST /api/dashboard/business/images
     * Upload an image for a business (multipart form data).
     */
    public function upload_image()
    {
        if ($this->input->method(TRUE) !== 'POST') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $business_id = $this->input->post('business_id');
        if (empty($business_id)) {
            $this->respond_error('business_id is required', 422);
        }

        $business = $this->Business_model->get_by_id($business_id);
        if ( ! $business) {
            $this->respond_error('Business not found', 404);
        }

        if ($business->owner_user_id != $this->current_user->id && $this->current_user->role !== 'admin') {
            $this->respond_error('You do not own this business', 403);
        }

        $upload_path = $this->config->item('upload_path') . 'businesses/' . $business_id . '/';
        if ( ! is_dir($upload_path)) {
            mkdir($upload_path, 0755, TRUE);
        }

        $config = array(
            'upload_path'   => $upload_path,
            'allowed_types' => $this->config->item('allowed_image_types'),
            'max_size'      => $this->config->item('max_image_size'),
            'encrypt_name'  => TRUE,
        );

        $this->load->library('upload', $config);

        if ( ! $this->upload->do_upload('image')) {
            $this->respond_error($this->upload->display_errors('', ''), 422);
        }

        $upload_data = $this->upload->data();
        $image_url = 'uploads/businesses/' . $business_id . '/' . $upload_data['file_name'];

        $sort_order = (int) $this->db->where('business_id', $business_id)
            ->select_max('sort_order')
            ->get('business_images')
            ->row()
            ->sort_order;

        $this->db->insert('business_images', array(
            'business_id' => $business_id,
            'image_url'   => $image_url,
            'alt_text'    => $this->input->post('alt_text') ?: '',
            'sort_order'  => $sort_order + 1,
            'created_at'  => date('Y-m-d H:i:s'),
        ));

        $image_id = $this->db->insert_id();

        $this->respond(array(
            'id'        => $image_id,
            'image_url' => $image_url,
        ), 201, 'Image uploaded successfully');
    }

    /**
     * DELETE /api/dashboard/business/images/:id
     */
    public function delete_image($image_id)
    {
        if ($this->input->method(TRUE) !== 'DELETE') {
            $this->respond_error('Method not allowed', 405);
        }

        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $image = $this->db->get_where('business_images', array('id' => $image_id))->row();
        if ( ! $image) {
            $this->respond_error('Image not found', 404);
        }

        // Verify ownership
        $business = $this->Business_model->get_by_id($image->business_id);
        if ($business->owner_user_id != $this->current_user->id && $this->current_user->role !== 'admin') {
            $this->respond_error('You do not own this business', 403);
        }

        // Delete file from disk
        $file_path = FCPATH . $image->image_url;
        if (file_exists($file_path)) {
            unlink($file_path);
        }

        $this->db->where('id', $image_id)->delete('business_images');

        $this->respond(NULL, 200, 'Image deleted successfully');
    }

    /**
     * GET /api/dashboard/reviews
     * Get reviews for the authenticated owner's businesses.
     */
    public function my_reviews()
    {
        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $pagination = $this->_get_pagination();

        $result = $this->Review_model->get_by_user(
            $this->current_user->id,
            $pagination['per_page'],
            $pagination['offset']
        );

        // Actually get reviews FOR the owner's businesses, not BY the owner
        $businesses = $this->Business_model->get_by_user($this->current_user->id);
        $all_reviews = array();
        $total = 0;

        foreach ($businesses as $biz) {
            $biz_reviews = $this->Review_model->get_by_business($biz->id, 100, 0);
            foreach ($biz_reviews['reviews'] as $review) {
                $review->business_name = $biz->name;
                $review->business_slug = $biz->slug;
                $all_reviews[] = $review;
            }
            $total += $biz_reviews['total'];
        }

        // Sort by date descending
        usort($all_reviews, function($a, $b) {
            return strtotime($b->created_at) - strtotime($a->created_at);
        });

        // Manual pagination
        $paged = array_slice($all_reviews, $pagination['offset'], $pagination['per_page']);

        $this->respond(array(
            'reviews'    => $paged,
            'pagination' => array(
                'total'    => $total,
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($total / $pagination['per_page']),
            ),
        ));
    }

    /**
     * GET /api/dashboard/stats
     * Get dashboard statistics for the business owner.
     */
    public function stats()
    {
        $this->_require_role(array('business_owner', 'admin', 'super_admin'));

        $businesses = $this->Business_model->get_by_user($this->current_user->id);

        $total_views = 0;
        $total_reviews = 0;
        $avg_rating = 0;
        $ratings_sum = 0;
        $rated_count = 0;

        foreach ($businesses as $biz) {
            $total_views += isset($biz->view_count) ? (int) $biz->view_count : 0;
            $total_reviews += (int) $biz->total_reviews;
            if ($biz->avg_rating > 0) {
                $ratings_sum += (float) $biz->avg_rating;
                $rated_count++;
            }
        }

        if ($rated_count > 0) {
            $avg_rating = round($ratings_sum / $rated_count, 1);
        }

        $this->respond(array(
            'business_count' => count($businesses),
            'total_views'    => $total_views,
            'total_reviews'  => $total_reviews,
            'avg_rating'     => $avg_rating,
        ));
    }
}
