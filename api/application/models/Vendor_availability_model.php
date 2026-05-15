<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vendor_availability_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get weekly schedule for a vendor.
     */
    public function get_schedule($vendor_id)
    {
        return $this->db->where('vendor_id', $vendor_id)
            ->order_by('day_of_week', 'ASC')
            ->get('vendor_availability')
            ->result();
    }

    /**
     * Set/update weekly schedule for a vendor.
     * Expects array of: [{day_of_week, start_time, end_time, is_available}]
     */
    public function set_schedule($vendor_id, $schedule)
    {
        // Delete existing schedule
        $this->db->where('vendor_id', $vendor_id)->delete('vendor_availability');

        foreach ($schedule as $day) {
            $this->db->insert('vendor_availability', array(
                'vendor_id'    => $vendor_id,
                'day_of_week'  => $day['day_of_week'],
                'start_time'   => $day['start_time'],
                'end_time'     => $day['end_time'],
                'is_available' => isset($day['is_available']) ? $day['is_available'] : 1,
            ));
        }

        return TRUE;
    }

    /**
     * Check if vendor is available on a specific date and time.
     */
    public function is_available($vendor_id, $date, $time)
    {
        // Check blocked dates
        $blocked = $this->db->where('vendor_id', $vendor_id)
            ->where('blocked_date', $date)
            ->count_all_results('vendor_blocked_dates');

        if ($blocked > 0) {
            return FALSE;
        }

        // Check weekly schedule
        $day_of_week = date('w', strtotime($date)); // 0=Sun, 6=Sat

        $slot = $this->db->where('vendor_id', $vendor_id)
            ->where('day_of_week', $day_of_week)
            ->where('is_available', 1)
            ->get('vendor_availability')
            ->row();

        if ( ! $slot) {
            return FALSE;
        }

        // Check if requested time falls within available hours
        if ($time < $slot->start_time || $time > $slot->end_time) {
            return FALSE;
        }

        return TRUE;
    }

    /**
     * Get blocked dates for a vendor.
     */
    public function get_blocked_dates($vendor_id)
    {
        return $this->db->where('vendor_id', $vendor_id)
            ->where('blocked_date >=', date('Y-m-d'))
            ->order_by('blocked_date', 'ASC')
            ->get('vendor_blocked_dates')
            ->result();
    }

    /**
     * Block a date.
     */
    public function block_date($vendor_id, $date, $reason = NULL)
    {
        // Use replace to handle duplicates
        return $this->db->replace('vendor_blocked_dates', array(
            'vendor_id'    => $vendor_id,
            'blocked_date' => $date,
            'reason'       => $reason,
        ));
    }

    /**
     * Unblock a date.
     */
    public function unblock_date($vendor_id, $date)
    {
        $this->db->where('vendor_id', $vendor_id);
        $this->db->where('blocked_date', $date);
        return $this->db->delete('vendor_blocked_dates');
    }
}
