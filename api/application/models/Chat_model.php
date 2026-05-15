<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Chat_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    public function get_or_create_conversation($booking_id, $customer_id, $vendor_id)
    {
        $conv = $this->db->where('booking_id', $booking_id)->get('chat_conversations')->row();
        if ($conv) return $conv;

        $this->db->insert('chat_conversations', array(
            'booking_id'  => $booking_id,
            'customer_id' => $customer_id,
            'vendor_id'   => $vendor_id,
            'is_active'   => 1,
            'created_at'  => date('Y-m-d H:i:s'),
        ));
        $id = $this->db->insert_id();
        return $this->db->where('id', $id)->get('chat_conversations')->row();
    }

    public function get_messages($conversation_id, $limit = 50, $after_id = 0)
    {
        $this->db->select('cm.*, u.full_name AS sender_name');
        $this->db->from('chat_messages cm');
        $this->db->join('users u', 'u.id = cm.sender_id');
        $this->db->where('cm.conversation_id', $conversation_id);
        if ($after_id > 0) {
            $this->db->where('cm.id >', $after_id);
        }
        $this->db->order_by('cm.created_at', 'ASC');
        $this->db->limit($limit);
        return $this->db->get()->result();
    }

    public function send_message($conversation_id, $sender_id, $message, $type = 'text', $image_url = NULL)
    {
        $this->db->insert('chat_messages', array(
            'conversation_id' => $conversation_id,
            'sender_id'       => $sender_id,
            'message'         => $message,
            'message_type'    => $type,
            'image_url'       => $image_url,
            'is_read'         => 0,
            'created_at'      => date('Y-m-d H:i:s'),
        ));
        return $this->db->insert_id();
    }

    public function mark_read($conversation_id, $reader_id)
    {
        $this->db->where('conversation_id', $conversation_id)
            ->where('sender_id !=', $reader_id)
            ->where('is_read', 0)
            ->update('chat_messages', array('is_read' => 1));
        return TRUE;
    }

    public function get_conversations($user_id, $limit = 20, $offset = 0)
    {
        $this->db->select('cc.*, b.booking_number,
            cust.full_name AS customer_name, vend.full_name AS vendor_name,
            (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = cc.id AND sender_id != ' . (int)$user_id . ' AND is_read = 0) AS unread_count,
            (SELECT message FROM chat_messages WHERE conversation_id = cc.id ORDER BY created_at DESC LIMIT 1) AS last_message,
            (SELECT created_at FROM chat_messages WHERE conversation_id = cc.id ORDER BY created_at DESC LIMIT 1) AS last_message_at');
        $this->db->from('chat_conversations cc');
        $this->db->join('bookings b', 'b.id = cc.booking_id');
        $this->db->join('users cust', 'cust.id = cc.customer_id');
        $this->db->join('users vend', 'vend.id = cc.vendor_id');
        $this->db->where("(cc.customer_id = {$user_id} OR cc.vendor_id = {$user_id})");
        $this->db->order_by('last_message_at', 'DESC');
        $this->db->limit($limit, $offset);
        return $this->db->get()->result();
    }
}
