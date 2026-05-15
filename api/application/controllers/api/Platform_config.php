<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Public endpoint — returns current platform configuration.
 * No authentication required. Used by frontend to adapt UI.
 */
class Platform_config extends Base_Api_Controller
{
    public function index()
    {
        $settings = array();
        $keys = array(
            'revenue_phase', 'geo_scope', 'platform_fee_enabled', 'platform_fee_amount',
            'surge_pricing_enabled', 'surge_fee_amount', 'surge_days',
            'commission_enabled', 'subscription_required', 'platform_name',
            'cod_enabled', 'online_payment_enabled',
        );

        $rows = $this->db->where_in('setting_key', $keys)->get('settings')->result();
        foreach ($rows as $row) {
            $settings[$row->setting_key] = $row->setting_value;
        }

        $phase = isset($settings['revenue_phase']) ? $settings['revenue_phase'] : '1';
        $geo = isset($settings['geo_scope']) ? $settings['geo_scope'] : 'india';

        // Build friendly labels
        $phase_names = array('1' => 'Free for All', '2' => 'Platform Fee', '3' => 'Subscriptions', '4' => 'Full Monetization');
        $geo_names = array('telangana' => 'Telangana', 'india' => 'All India');
        $geo_taglines = array(
            'telangana' => 'Serving Hyderabad & Telangana',
            'india'     => 'Serving 500+ Cities Across India',
        );

        $this->respond(array(
            'phase'              => $phase,
            'phase_name'         => isset($phase_names[$phase]) ? $phase_names[$phase] : $phase_names['1'],
            'geo_scope'          => $geo,
            'geo_name'           => isset($geo_names[$geo]) ? $geo_names[$geo] : 'All India',
            'geo_tagline'        => isset($geo_taglines[$geo]) ? $geo_taglines[$geo] : $geo_taglines['india'],
            'platform_fee'       => (isset($settings['platform_fee_enabled']) && $settings['platform_fee_enabled'] === '1')
                                    ? (float)(isset($settings['platform_fee_amount']) ? $settings['platform_fee_amount'] : 39) : 0,
            'surge_pricing'      => isset($settings['surge_pricing_enabled']) && $settings['surge_pricing_enabled'] === '1',
            'commission_enabled' => isset($settings['commission_enabled']) && $settings['commission_enabled'] === '1',
            'subscription_required' => isset($settings['subscription_required']) && $settings['subscription_required'] === '1',
            'cod_enabled'        => isset($settings['cod_enabled']) && $settings['cod_enabled'] === '1',
            'online_payment_enabled' => isset($settings['online_payment_enabled']) && $settings['online_payment_enabled'] === '1',
        ));
    }
}
