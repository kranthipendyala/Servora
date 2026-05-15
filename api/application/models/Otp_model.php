<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Otp_model extends CI_Model
{
    protected $table = 'otp_verifications';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Generate and store an OTP.
     *
     * @param string $phone
     * @param string $purpose login|register|verify_phone|reset_password
     * @return string The OTP code
     */
    public function generate($phone, $purpose = 'login')
    {
        // Rate limit: max 5 OTPs per phone per hour
        $one_hour_ago = date('Y-m-d H:i:s', strtotime('-1 hour'));
        $row = $this->db->query(
            "SELECT COUNT(*) AS cnt FROM {$this->table} WHERE phone = ? AND created_at >= ?",
            array($phone, $one_hour_ago)
        )->row();
        $recent_count = $row ? (int) $row->cnt : 0;

        if ($recent_count >= 5) {
            return FALSE;
        }

        // Invalidate any existing unused OTPs for this phone+purpose
        $this->db->query(
            "UPDATE {$this->table} SET is_used = 1 WHERE phone = ? AND purpose = ? AND is_used = 0",
            array($phone, $purpose)
        );

        $otp = str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        $created_at = date('Y-m-d H:i:s');

        $this->db->query(
            "INSERT INTO {$this->table} (phone, otp_code, purpose, is_used, attempts, expires_at, created_at)
             VALUES (?, ?, ?, 0, 0, ?, ?)",
            array($phone, $otp, $purpose, $expires_at, $created_at)
        );

        return $otp;
    }

    /**
     * Verify an OTP.
     *
     * @param string $phone
     * @param string $otp_code
     * @param string $purpose
     * @return bool
     */
    public function verify($phone, $otp_code, $purpose = 'login')
    {
        $record = $this->db->query(
            "SELECT * FROM {$this->table}
             WHERE phone = ? AND purpose = ? AND is_used = 0 AND expires_at >= ?
             ORDER BY created_at DESC LIMIT 1",
            array($phone, $purpose, date('Y-m-d H:i:s'))
        )->row();

        if ( ! $record) {
            return FALSE;
        }

        // Check max attempts
        if ($record->attempts >= 5) {
            $this->db->query(
                "UPDATE {$this->table} SET is_used = 1 WHERE id = ?",
                array($record->id)
            );
            return FALSE;
        }

        // Increment attempts
        $this->db->query(
            "UPDATE {$this->table} SET attempts = attempts + 1 WHERE id = ?",
            array($record->id)
        );

        if ($record->otp_code !== $otp_code) {
            return FALSE;
        }

        // Mark as used
        $this->db->query(
            "UPDATE {$this->table} SET is_used = 1 WHERE id = ?",
            array($record->id)
        );

        return TRUE;
    }

    /**
     * Clean up expired OTPs (can be called via cron).
     */
    public function cleanup()
    {
        $this->db->query(
            "DELETE FROM {$this->table} WHERE expires_at < ?",
            array(date('Y-m-d H:i:s'))
        );
    }
}
