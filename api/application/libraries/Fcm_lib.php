<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Firebase Cloud Messaging (FCM) Library
 * Sends push notifications to mobile devices via FCM HTTP v1 API.
 */
class Fcm_lib
{
    private $CI;
    private $server_key;

    public function __construct()
    {
        $this->CI =& get_instance();
        $this->CI->load->database();

        $row = $this->CI->db->where('setting_key', 'fcm_server_key')->get('settings')->row();
        $this->server_key = $row ? $row->setting_value : '';
    }

    /**
     * Send push notification to a single user.
     */
    public function send_to_user($user_id, $title, $body, $data = array())
    {
        $user = $this->CI->db->select('fcm_token')->where('id', $user_id)->get('users')->row();
        if ( ! $user || empty($user->fcm_token)) {
            return FALSE;
        }

        return $this->_send($user->fcm_token, $title, $body, $data);
    }

    /**
     * Send push notification to multiple users.
     */
    public function send_to_users($user_ids, $title, $body, $data = array())
    {
        $users = $this->CI->db->select('fcm_token')
            ->where_in('id', $user_ids)
            ->where('fcm_token IS NOT NULL')
            ->where('fcm_token !=', '')
            ->get('users')->result();

        $results = array();
        foreach ($users as $user) {
            $results[] = $this->_send($user->fcm_token, $title, $body, $data);
        }
        return $results;
    }

    /**
     * Send FCM push notification.
     */
    private function _send($token, $title, $body, $data = array())
    {
        if (empty($this->server_key)) {
            log_message('error', 'FCM: server_key not configured');
            return FALSE;
        }

        $payload = array(
            'to' => $token,
            'notification' => array(
                'title' => $title,
                'body'  => $body,
                'sound' => 'default',
            ),
            'data' => $data,
            'priority' => 'high',
        );

        $ch = curl_init('https://fcm.googleapis.com/fcm/send');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: key=' . $this->server_key,
        ));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200) {
            log_message('error', 'FCM error: HTTP ' . $http_code . ' - ' . $response);
            return FALSE;
        }

        return json_decode($response, TRUE);
    }
}
