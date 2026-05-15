<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Notification_model extends CI_Model
{
    protected $table = 'notifications';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Create a notification.
     */
    public function create($user_id, $type, $title, $body = NULL, $data = NULL)
    {
        $insert = array(
            'user_id'    => $user_id,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'data'       => $data ? json_encode($data) : NULL,
            'is_read'    => 0,
            'created_at' => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    /**
     * Get notifications for a user (paginated).
     */
    public function get_by_user($user_id, $limit = 20, $offset = 0)
    {
        $total = $this->db->where('user_id', $user_id)->count_all_results($this->table);

        $notifications = $this->db->where('user_id', $user_id)
            ->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get($this->table)
            ->result();

        foreach ($notifications as &$n) {
            if ($n->data) {
                $n->data = json_decode($n->data);
            }
        }

        return array('notifications' => $notifications, 'total' => $total);
    }

    /**
     * Get unread count.
     */
    public function unread_count($user_id)
    {
        return $this->db->where('user_id', $user_id)
            ->where('is_read', 0)
            ->count_all_results($this->table);
    }

    /**
     * Mark a single notification as read.
     */
    public function mark_read($id, $user_id)
    {
        $this->db->where('id', $id);
        $this->db->where('user_id', $user_id);
        return $this->db->update($this->table, array('is_read' => 1));
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function mark_all_read($user_id)
    {
        $this->db->where('user_id', $user_id);
        $this->db->where('is_read', 0);
        return $this->db->update($this->table, array('is_read' => 1));
    }
}
