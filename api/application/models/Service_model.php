<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Service_model extends CI_Model
{
    protected $table = 'services';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get services by business ID.
     */
    public function get_by_business($business_id, $active_only = TRUE)
    {
        $this->db->select('s.*, c.name AS category_name, c.slug AS category_slug');
        $this->db->from('services s');
        $this->db->join('categories c', 'c.id = s.category_id', 'left');
        $this->db->where('s.business_id', $business_id);

        if ($active_only) {
            $this->db->where('s.is_active', 1);
        }

        $this->db->order_by('s.sort_order', 'ASC');
        $services = $this->db->get()->result();

        foreach ($services as &$service) {
            $service->variants = $this->get_variants($service->id);
        }

        return $services;
    }

    /**
     * Get services by category.
     */
    public function get_by_category($category_id, $limit = 20, $offset = 0)
    {
        $this->db->select('s.*, b.name AS business_name, b.slug AS business_slug, c.name AS category_name');
        $this->db->from('services s');
        $this->db->join('businesses b', 'b.id = s.business_id');
        $this->db->join('categories c', 'c.id = s.category_id', 'left');
        $this->db->where('s.category_id', $category_id);
        $this->db->where('s.is_active', 1);
        $this->db->where('b.status', 'approved');
        $this->db->where('b.is_active', 1);
        $this->db->order_by('s.base_price', 'ASC');
        $this->db->limit($limit, $offset);

        return $this->db->get()->result();
    }

    /**
     * Get a single service by ID.
     */
    public function get_by_id($id)
    {
        $this->db->select('s.*, c.name AS category_name, c.slug AS category_slug, b.name AS business_name, b.slug AS business_slug');
        $this->db->from('services s');
        $this->db->join('categories c', 'c.id = s.category_id', 'left');
        $this->db->join('businesses b', 'b.id = s.business_id', 'left');
        $this->db->where('s.id', $id);

        $service = $this->db->get()->row();

        if ($service) {
            $service->variants = $this->get_variants($service->id);
        }

        return $service;
    }

    /**
     * Get variants for a service.
     */
    public function get_variants($service_id)
    {
        return $this->db->where('service_id', $service_id)
            ->where('is_active', 1)
            ->order_by('sort_order', 'ASC')
            ->get('service_variants')
            ->result();
    }

    /**
     * Create a service.
     */
    public function create($data)
    {
        $insert = array(
            'business_id'       => $data['business_id'],
            'category_id'       => $data['category_id'],
            'name'              => $data['name'],
            'slug'              => $this->_generate_slug($data['name'], $data['business_id']),
            'description'       => isset($data['description']) ? $data['description'] : NULL,
            'short_description' => isset($data['short_description']) ? $data['short_description'] : NULL,
            'base_price'        => $data['base_price'],
            'discounted_price'  => isset($data['discounted_price']) ? $data['discounted_price'] : NULL,
            'price_unit'        => isset($data['price_unit']) ? $data['price_unit'] : 'fixed',
            'duration_minutes'  => isset($data['duration_minutes']) ? $data['duration_minutes'] : 60,
            'image'             => isset($data['image']) ? $data['image'] : NULL,
            'sort_order'        => isset($data['sort_order']) ? $data['sort_order'] : 0,
            'is_active'         => 1,
            'created_at'        => date('Y-m-d H:i:s'),
            'updated_at'        => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        $id = $this->db->insert_id();

        if ($id && ! empty($data['variants'])) {
            foreach ($data['variants'] as $variant) {
                $this->create_variant($id, $variant);
            }
        }

        if ($id) {
            $this->_reindex_business((int) $data['business_id']);
        }

        return $id ? $this->get_by_id($id) : FALSE;
    }

    /**
     * Update a service.
     */
    public function update($id, $data)
    {
        $allowed = array('name', 'description', 'short_description', 'base_price', 'discounted_price',
            'price_unit', 'duration_minutes', 'image', 'category_id', 'sort_order', 'is_active');
        $update = array();

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        if (isset($data['name'])) {
            $service = $this->get_by_id($id);
            if ($service) {
                $update['slug'] = $this->_generate_slug($data['name'], $service->business_id);
            }
        }

        if (empty($update)) {
            return FALSE;
        }

        $update['updated_at'] = date('Y-m-d H:i:s');

        $this->db->where('id', $id);
        $result = $this->db->update($this->table, $update);

        $svc = $this->db->select('business_id')->from($this->table)->where('id', $id)->get()->row();
        if ($svc) $this->_reindex_business((int) $svc->business_id);

        return $result;
    }

    /**
     * Delete a service.
     */
    public function delete($id)
    {
        $svc = $this->db->select('business_id')->from($this->table)->where('id', $id)->get()->row();
        $this->db->where('id', $id);
        $result = $this->db->delete($this->table);
        if ($svc) $this->_reindex_business((int) $svc->business_id);
        return $result;
    }

    /**
     * Trigger ES reindex of the owning business after service changes.
     */
    private function _reindex_business($business_id)
    {
        if ( ! $business_id) return;
        $this->load->model('Business_model');
        $this->Business_model->reindex_to_es($business_id);
    }

    /**
     * Create a variant for a service.
     */
    public function create_variant($service_id, $data)
    {
        $insert = array(
            'service_id'       => $service_id,
            'name'             => $data['name'],
            'price'            => $data['price'],
            'duration_minutes' => isset($data['duration_minutes']) ? $data['duration_minutes'] : NULL,
            'is_active'        => 1,
            'sort_order'       => isset($data['sort_order']) ? $data['sort_order'] : 0,
        );

        $this->db->insert('service_variants', $insert);
        return $this->db->insert_id();
    }

    /**
     * Check if a service belongs to a specific business.
     */
    public function belongs_to_business($service_id, $business_id)
    {
        return $this->db->where('id', $service_id)
            ->where('business_id', $business_id)
            ->count_all_results($this->table) > 0;
    }

    /**
     * Generate a unique slug.
     */
    private function _generate_slug($name, $business_id)
    {
        $slug = url_title($name, 'dash', TRUE);
        $slug = $slug . '-' . $business_id;

        $count = $this->db->where('slug', $slug)->count_all_results($this->table);
        if ($count > 0) {
            $slug = $slug . '-' . ($count + 1);
        }

        return $slug;
    }
}
