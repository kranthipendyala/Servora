<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Coupons extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Coupon_model');
    }

    /** POST /api/coupons/validate */
    public function validate_coupon()
    {
        $this->_require_auth();
        $data = $this->_get_json_body();

        if (empty($data['code'])) {
            $this->respond_error('Coupon code is required', 422);
        }
        if (empty($data['amount'])) {
            $this->respond_error('Order amount is required', 422);
        }

        $category_id = isset($data['category_id']) ? $data['category_id'] : NULL;
        $result = $this->Coupon_model->validate($data['code'], $data['amount'], $category_id, $this->current_user->id);

        if ( ! $result['valid']) {
            $this->respond_error($result['message'], 400);
        }

        $this->respond(array(
            'code'     => $data['code'],
            'discount' => $result['discount'],
            'message'  => $result['message'],
        ));
    }
}
