<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Notifications extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Notification_model');
    }

    /**
     * GET /api/notifications
     */
    public function index()
    {
        $this->_require_auth();
        $pagination = $this->_get_pagination();

        $result = $this->Notification_model->get_by_user(
            $this->current_user->id,
            $pagination['per_page'],
            $pagination['offset']
        );

        $this->respond(array(
            'notifications' => $result['notifications'],
            'pagination'    => array(
                'total'    => $result['total'],
                'page'     => $pagination['page'],
                'per_page' => $pagination['per_page'],
                'pages'    => ceil($result['total'] / $pagination['per_page']),
            ),
        ));
    }

    /**
     * GET /api/notifications/unread-count
     */
    public function unread_count()
    {
        $this->_require_auth();
        $count = $this->Notification_model->unread_count($this->current_user->id);
        $this->respond(array('unread_count' => $count));
    }

    /**
     * POST /api/notifications/:id/read
     */
    public function mark_read($id)
    {
        $this->_require_auth();
        $this->Notification_model->mark_read($id, $this->current_user->id);
        $this->respond(NULL, 200, 'Notification marked as read');
    }

    /**
     * POST /api/notifications/read-all
     */
    public function mark_all_read()
    {
        $this->_require_auth();
        $this->Notification_model->mark_all_read($this->current_user->id);
        $this->respond(NULL, 200, 'All notifications marked as read');
    }
}
