<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class City_model extends CI_Model
{
    protected $table = 'cities';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all cities with state info.
     */
    public function get_all()
    {
        $this->db->select('c.id, c.name, c.slug, c.state_id, c.is_active, s.name AS state_name, s.slug AS state_slug');
        $this->db->from('cities c');
        $this->db->join('states s', 's.id = c.state_id', 'left');
        $this->db->where('c.is_active', 1);
        $this->db->order_by('c.name', 'ASC');

        return $this->db->get()->result();
    }

    /**
     * Get a single city by slug with state info and locality count.
     */
    public function get_by_slug($slug)
    {
        $this->db->select('c.*, s.name AS state_name, s.slug AS state_slug');
        $this->db->from('cities c');
        $this->db->join('states s', 's.id = c.state_id', 'left');
        $this->db->where('c.slug', $slug);

        $city = $this->db->get()->row();

        if ( ! $city) {
            return NULL;
        }

        // Locality count
        $city->locality_count = (int) $this->db->where('city_id', $city->id)
            ->count_all_results('localities');

        // Business count — includes businesses serving this city via service_areas
        $city->business_count = (int) $this->db->query("
            SELECT COUNT(DISTINCT b.id) AS cnt FROM businesses b
            WHERE b.status = 'approved'
            AND (b.city_id = ? OR b.id IN (SELECT bsa.business_id FROM business_service_areas bsa WHERE bsa.city_id = ? AND bsa.is_active = 1))
        ", array($city->id, $city->id))->row()->cnt;

        return $city;
    }

    /**
     * Get a city by ID.
     */
    public function get_by_id($id)
    {
        return $this->db->get_where($this->table, array('id' => $id))->row();
    }

    /**
     * Get all cities with business count statistics.
     */
    public function get_with_stats()
    {
        // Count businesses that have home city OR serve via service_areas
        return $this->db->query("
            SELECT c.id, c.name, c.slug, c.state_id, c.is_active,
                   s.name AS state_name,
                   (
                       SELECT COUNT(DISTINCT b.id) FROM businesses b
                       WHERE b.status = 'approved'
                       AND (b.city_id = c.id OR b.id IN (
                           SELECT bsa.business_id FROM business_service_areas bsa
                           WHERE bsa.city_id = c.id AND bsa.is_active = 1
                       ))
                   ) AS business_count
            FROM cities c
            LEFT JOIN states s ON s.id = c.state_id
            WHERE c.is_active = 1
            ORDER BY business_count DESC
        ")->result();
    }

    /**
     * Get all city slugs for sitemap.
     */
    public function get_all_slugs()
    {
        return $this->db->select('slug')
            ->from($this->table)
            ->where('is_active', 1)
            ->get()
            ->result();
    }

    /**
     * Create a new city.
     */
    public function create($data)
    {
        $insert = array(
            'name'        => $data['name'],
            'slug'        => unique_slug($data['name'], $this->table),
            'state_id'    => isset($data['state_id']) ? (int) $data['state_id'] : NULL,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1,
            'meta_title'       => isset($data['meta_title']) ? $data['meta_title'] : NULL,
            'meta_description' => isset($data['meta_description']) ? $data['meta_description'] : NULL,
            'latitude'    => isset($data['latitude']) ? $data['latitude'] : NULL,
            'longitude'   => isset($data['longitude']) ? $data['longitude'] : NULL,
            'created_at'  => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    /**
     * Update a city.
     */
    public function update($id, $data)
    {
        $allowed = array('name', 'state_id', 'is_active', 'meta_title', 'meta_description', 'latitude', 'longitude');
        $update = array();

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        if (isset($data['name'])) {
            $update['slug'] = unique_slug($data['name'], $this->table, 'slug', $id);
        }

        if (empty($update)) {
            return FALSE;
        }

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }
}
