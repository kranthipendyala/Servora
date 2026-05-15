<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Subscriptions extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Subscription_model');
    }

    /** GET /api/vendor/subscriptions/plans */
    public function plans()
    {
        $plans = $this->Subscription_model->get_plans();
        foreach ($plans as &$p) {
            if ($p->features) $p->features = json_decode($p->features);
        }
        $this->respond($plans);
    }

    /** GET /api/vendor/subscriptions/current */
    public function current()
    {
        $this->_require_role(array('vendor', 'business_owner'));
        $sub = $this->Subscription_model->get_active_subscription($this->current_user->id);
        if ($sub && $sub->features) $sub->features = json_decode($sub->features);
        $this->respond($sub);
    }

    /** POST /api/vendor/subscriptions/subscribe */
    public function subscribe()
    {
        $this->_require_role(array('vendor', 'business_owner'));
        $data = $this->_get_json_body();

        if (empty($data['plan_id'])) {
            $this->respond_error('plan_id is required', 422);
        }

        $billing = isset($data['billing_cycle']) ? $data['billing_cycle'] : 'monthly';
        $razorpay_id = isset($data['razorpay_subscription_id']) ? $data['razorpay_subscription_id'] : NULL;

        $id = $this->Subscription_model->subscribe($this->current_user->id, $data['plan_id'], $billing, $razorpay_id);

        if ( ! $id) {
            $this->respond_error('Failed to subscribe', 500);
        }

        $sub = $this->Subscription_model->get_active_subscription($this->current_user->id);
        $this->respond($sub, 201, 'Subscription created');
    }

    /** POST /api/vendor/subscriptions/cancel */
    public function cancel()
    {
        $this->_require_role(array('vendor', 'business_owner'));
        $this->Subscription_model->cancel_subscription($this->current_user->id);
        $this->respond(NULL, 200, 'Subscription cancelled');
    }
}
