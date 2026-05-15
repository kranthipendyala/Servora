<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Locality_model extends CI_Model
{
    protected $table = 'localities';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all localities for a given city, with business counts.
     */
    public function get_by_city($city_id)
    {
        $this->db->select('
            l.id, l.name, l.slug, l.pin_code,
            COUNT(DISTINCT b.id) AS business_count
        ');
        $this->db->from('localities l');
        $this->db->join('businesses b', 'b.locality_id = l.id AND b.status = "approved" AND b.is_active = 1', 'left');
        $this->db->where('l.city_id', $city_id);
        $this->db->where('l.is_active', 1);
        $this->db->group_by('l.id');
        $this->db->order_by('l.name', 'ASC');

        return $this->db->get()->result();
    }

    /**
     * Get a specific locality by city_id and locality slug.
     */
    public function get_by_slug($city_id, $slug)
    {
        $locality = $this->db->select('l.*, c.name AS city_name, c.slug AS city_slug')
            ->from('localities l')
            ->join('cities c', 'c.id = l.city_id', 'left')
            ->where('l.city_id', $city_id)
            ->where('l.slug', $slug)
            ->where('l.is_active', 1)
            ->get()
            ->row();

        if ($locality) {
            $locality->business_count = (int) $this->db
                ->where('locality_id', $locality->id)
                ->where('status', 'approved')
                ->where('is_active', 1)
                ->count_all_results('businesses');
        }

        return $locality;
    }

    /**
     * Get locality by ID.
     */
    public function get_by_id($id)
    {
        return $this->db->get_where($this->table, array('id' => $id))->row();
    }

    /**
     * Get all locality slugs grouped by city for sitemap.
     */
    public function get_all_slugs()
    {
        return $this->db->select('l.slug AS locality_slug, c.slug AS city_slug')
            ->from('localities l')
            ->join('cities c', 'c.id = l.city_id')
            ->where('l.is_active', 1)
            ->where('c.is_active', 1)
            ->get()
            ->result();
    }
}
