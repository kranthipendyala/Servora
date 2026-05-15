<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Addresses extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Address_model');
    }

    /**
     * GET /api/addresses
     */
    public function index()
    {
        $this->_require_auth();
        $addresses = $this->Address_model->get_by_user($this->current_user->id);
        $this->respond($addresses);
    }

    /**
     * POST /api/addresses
     */
    public function create()
    {
        $this->_require_auth();

        $data = $this->_get_json_body();
        $missing = $this->_validate_required($data, array('address_line1', 'pin_code'));

        if ( ! empty($missing)) {
            $this->respond_error('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $data['user_id'] = $this->current_user->id;
        $address = $this->Address_model->create($data);

        if ( ! $address) {
            $this->respond_error('Failed to create address', 500);
        }

        $this->respond($address, 201, 'Address created');
    }

    /**
     * PUT /api/addresses/:id
     */
    public function update($id)
    {
        $this->_require_auth();

        if ( ! $this->Address_model->belongs_to_user($id, $this->current_user->id)) {
            $this->respond_error('Address not found', 404);
        }

        $data = $this->_get_json_body();
        $this->Address_model->update($id, $data);

        $this->respond($this->Address_model->get_by_id($id), 200, 'Address updated');
    }

    /**
     * DELETE /api/addresses/:id
     */
    public function delete($id)
    {
        $this->_require_auth();

        if ( ! $this->Address_model->belongs_to_user($id, $this->current_user->id)) {
            $this->respond_error('Address not found', 404);
        }

        $this->Address_model->delete($id);
        $this->respond(NULL, 200, 'Address deleted');
    }
}
