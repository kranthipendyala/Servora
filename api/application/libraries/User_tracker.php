<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * User Tracker Library
 * Captures IP, browser, device, location data on login/register events.
 */
class User_tracker
{
    private $CI;

    public function __construct()
    {
        $this->CI =& get_instance();
        $this->CI->load->database();
    }

    /**
     * Log a user event (login, register, etc.)
     *
     * @param string $event_type  login|register|otp_login|google_login
     * @param int    $user_id     User ID (null if not yet created)
     * @param array  $extra       Additional data to store
     */
    public function log($event_type, $user_id = NULL, $extra = array())
    {
        $ip = $this->_get_ip();
        $ua = $this->_get_user_agent();
        $browser = $this->_parse_browser($ua);
        $os = $this->_parse_os($ua);
        $device = $this->_parse_device($ua);
        $location = $this->_get_location_from_ip($ip);

        $data = array(
            'user_id'    => $user_id,
            'event_type' => $event_type,
            'ip_address' => $ip,
            'user_agent' => $ua,
            'browser'    => $browser,
            'os'         => $os,
            'device'     => $device,
            'country'    => isset($location['country']) ? $location['country'] : NULL,
            'city'       => isset($location['city']) ? $location['city'] : NULL,
            'region'     => isset($location['region']) ? $location['region'] : NULL,
            'latitude'   => isset($location['lat']) ? $location['lat'] : NULL,
            'longitude'  => isset($location['lon']) ? $location['lon'] : NULL,
            'phone'      => isset($extra['phone']) ? $extra['phone'] : NULL,
            'email'      => isset($extra['email']) ? $extra['email'] : NULL,
            'referrer'   => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : NULL,
            'extra'      => ! empty($extra) ? json_encode($extra) : NULL,
            'created_at' => date('Y-m-d H:i:s'),
        );

        $this->CI->db->insert('user_login_logs', $data);
        return $this->CI->db->insert_id();
    }

    /**
     * Get client IP address.
     */
    private function _get_ip()
    {
        $headers = array(
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR',
        );

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // X-Forwarded-For can have multiple IPs — take the first
                if (strpos($ip, ',') !== FALSE) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Get user agent string.
     */
    private function _get_user_agent()
    {
        return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    }

    /**
     * Parse browser name from user agent.
     */
    private function _parse_browser($ua)
    {
        if (empty($ua)) return 'Unknown';

        $browsers = array(
            'Edge'    => '/Edg\/([0-9.]+)/',
            'Chrome'  => '/Chrome\/([0-9.]+)/',
            'Firefox' => '/Firefox\/([0-9.]+)/',
            'Safari'  => '/Version\/([0-9.]+).*Safari/',
            'Opera'   => '/OPR\/([0-9.]+)/',
            'IE'      => '/MSIE ([0-9.]+)|Trident.*rv:([0-9.]+)/',
        );

        foreach ($browsers as $name => $pattern) {
            if (preg_match($pattern, $ua, $matches)) {
                $version = isset($matches[1]) && $matches[1] ? $matches[1] : (isset($matches[2]) ? $matches[2] : '');
                return $name . ($version ? ' ' . explode('.', $version)[0] : '');
            }
        }

        return 'Other';
    }

    /**
     * Parse OS from user agent.
     */
    private function _parse_os($ua)
    {
        if (empty($ua)) return 'Unknown';

        $os_list = array(
            'Windows 11' => '/Windows NT 10.*Win64/',
            'Windows 10' => '/Windows NT 10/',
            'Windows 8'  => '/Windows NT 6\.[23]/',
            'Windows 7'  => '/Windows NT 6\.1/',
            'Mac OS'     => '/Macintosh.*Mac OS X ([0-9_]+)/',
            'iOS'        => '/iPhone.*OS ([0-9_]+)|iPad.*OS ([0-9_]+)/',
            'Android'    => '/Android ([0-9.]+)/',
            'Linux'      => '/Linux/',
            'Chrome OS'  => '/CrOS/',
        );

        foreach ($os_list as $name => $pattern) {
            if (preg_match($pattern, $ua, $matches)) {
                $version = isset($matches[1]) ? str_replace('_', '.', $matches[1]) : '';
                return $name . ($version ? ' ' . explode('.', $version)[0] : '');
            }
        }

        return 'Other';
    }

    /**
     * Parse device type from user agent.
     */
    private function _parse_device($ua)
    {
        if (empty($ua)) return 'Unknown';

        if (preg_match('/iPhone/', $ua)) return 'iPhone';
        if (preg_match('/iPad/', $ua)) return 'iPad';
        if (preg_match('/Android.*Mobile/', $ua)) return 'Android Phone';
        if (preg_match('/Android/', $ua)) return 'Android Tablet';
        if (preg_match('/Windows Phone/', $ua)) return 'Windows Phone';
        if (preg_match('/Macintosh/', $ua)) return 'Mac';
        if (preg_match('/Windows/', $ua)) return 'Windows PC';
        if (preg_match('/Linux/', $ua)) return 'Linux PC';
        if (preg_match('/Bot|Crawler|Spider/i', $ua)) return 'Bot';

        return 'Desktop';
    }

    /**
     * Get location from IP using free ip-api.com service.
     */
    private function _get_location_from_ip($ip)
    {
        $default = array('country' => NULL, 'city' => NULL, 'region' => NULL, 'lat' => NULL, 'lon' => NULL);

        // Skip for local/private IPs
        if (in_array($ip, array('127.0.0.1', '::1', '0.0.0.0')) || preg_match('/^(10\.|192\.168\.|172\.(1[6-9]|2|3[01]))/', $ip)) {
            return array_merge($default, array('city' => 'Local', 'country' => 'Local'));
        }

        // Use ip-api.com (free, 45 req/min)
        $ch = curl_init("http://ip-api.com/json/{$ip}?fields=country,regionName,city,lat,lon");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, TRUE);
            if ($data && isset($data['country'])) {
                return array(
                    'country' => $data['country'],
                    'city'    => isset($data['city']) ? $data['city'] : NULL,
                    'region'  => isset($data['regionName']) ? $data['regionName'] : NULL,
                    'lat'     => isset($data['lat']) ? $data['lat'] : NULL,
                    'lon'     => isset($data['lon']) ? $data['lon'] : NULL,
                );
            }
        }

        return $default;
    }
}
