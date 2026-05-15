<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Business_model extends CI_Model
{
    protected $table = 'businesses';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Best-effort push a business to Elasticsearch after a MySQL write.
     * Never throws — ES failures are logged so admin saves still succeed when ES is down.
     */
    public function reindex_to_es($business_id)
    {
        if ( ! $business_id) return;
        $CI =& get_instance();
        try {
            $CI->load->library('Business_indexer', NULL, 'indexer');
            $CI->indexer->index_one((int) $business_id);
        } catch (\Throwable $e) {
            log_message('error', 'ES reindex failed for business ' . $business_id . ': ' . $e->getMessage());
        }
    }

    public function delete_from_es($business_id)
    {
        if ( ! $business_id) return;
        $CI =& get_instance();
        try {
            $CI->load->library('Business_indexer', NULL, 'indexer');
            $CI->indexer->delete_one((int) $business_id);
        } catch (\Throwable $e) {
            log_message('error', 'ES delete failed for business ' . $business_id . ': ' . $e->getMessage());
        }
    }

    /**
     * Hydrate a list of business ids into the listing/search shape, preserving the given order.
     */
    public function hydrate_by_ids(array $ids)
    {
        if (empty($ids)) return array();

        $this->db->select('
            b.id, b.name, b.slug, b.phone, b.address, b.avg_rating,
            b.total_reviews, b.logo, b.is_verified, b.is_featured, b.is_active,
            b.status, b.owner_user_id, b.latitude, b.longitude,
            c.name AS city_name, c.slug AS city_slug,
            l.name AS locality_name, l.slug AS locality_slug
        ');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->db->where_in('b.id', $ids);
        $rows = $this->db->get()->result();

        $by_id = array();
        foreach ($rows as $r) $by_id[(int) $r->id] = $r;

        $ordered = array();
        foreach ($ids as $id) {
            $id = (int) $id;
            if (isset($by_id[$id])) {
                $biz = $by_id[$id];
                $biz->categories    = $this->_get_business_categories($biz->id);
                $biz->service_areas = $this->_get_service_areas($biz->id);
                $ordered[] = $biz;
            }
        }
        return $ordered;
    }

    /**
     * Get a single business by its slug, with all related data.
     */
    public function get_by_slug($slug)
    {
        $this->db->select('
            b.*,
            c.name AS city_name, c.slug AS city_slug,
            s.name AS state_name, s.slug AS state_slug,
            l.name AS locality_name, l.slug AS locality_slug
        ');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('states s', 's.id = b.state_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->db->where('b.slug', $slug);
        $this->db->where('b.status', 'approved');

        $business = $this->db->get()->row();

        if ( ! $business) {
            return NULL;
        }

        $business->categories = $this->_get_business_categories($business->id);
        $business->images = $this->_get_business_images($business->id);
        $business->services_by_category = $this->_get_services_grouped($business->id);
        $business->service_areas = $this->_get_service_areas($business->id);

        // Load approved reviews
        $this->load->model('Review_model');
        $review_data = $this->Review_model->get_by_business($business->id, 10);
        $business->reviews = $review_data['reviews'];
        $business->review_count = $review_data['total'];

        // Parse business_hours JSON field
        if ( ! empty($business->business_hours)) {
            $business->working_hours = json_decode($business->business_hours);
        } else {
            $business->working_hours = NULL;
        }

        // Parse social_links JSON field
        if ( ! empty($business->social_links)) {
            $business->social_links = json_decode($business->social_links);
        }

        return $business;
    }

    /**
     * Get a single business by ID.
     */
    public function get_by_id($id)
    {
        $this->db->select('
            b.*,
            c.name AS city_name, c.slug AS city_slug,
            s.name AS state_name, s.slug AS state_slug,
            l.name AS locality_name, l.slug AS locality_slug
        ');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('states s', 's.id = b.state_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->db->where('b.id', $id);

        $business = $this->db->get()->row();

        if ($business) {
            $business->categories = $this->_get_business_categories($business->id);
            $business->images = $this->_get_business_images($business->id);
            $business->service_areas = $this->_get_service_areas($business->id);

            if ( ! empty($business->business_hours)) {
                $business->working_hours = json_decode($business->business_hours);
            } else {
                $business->working_hours = NULL;
            }

            if ( ! empty($business->social_links)) {
                $business->social_links = json_decode($business->social_links);
            }
        }

        return $business;
    }

    /**
     * Get service areas (cities) for a business.
     */
    public function _get_service_areas($business_id)
    {
        return $this->db->select('bsa.id, bsa.city_id, c.name AS city_name, c.slug AS city_slug, bsa.is_active')
            ->from('business_service_areas bsa')
            ->join('cities c', 'c.id = bsa.city_id')
            ->where('bsa.business_id', $business_id)
            ->order_by('c.name', 'ASC')
            ->get()->result();
    }

    /**
     * Sync service areas for a business.
     */
    public function sync_service_areas($business_id, $city_ids)
    {
        // Remove old
        $this->db->where('business_id', $business_id)->delete('business_service_areas');
        // Insert new
        if ( ! empty($city_ids) && is_array($city_ids)) {
            foreach ($city_ids as $cid) {
                $this->db->insert('business_service_areas', array(
                    'business_id' => $business_id,
                    'city_id'     => (int) $cid,
                    'is_active'   => 1,
                ));
            }
        }

        $this->reindex_to_es($business_id);
    }

    /**
     * Get paginated business listing with filters.
     *
     * @param array $filters Possible keys: city_slug, category_slug, locality_slug,
     *                       sort_by, sort_dir, status, user_id
     * @param int   $limit
     * @param int   $offset
     * @return array ['businesses' => array, 'total' => int]
     */
    public function get_listing($filters = array(), $limit = 20, $offset = 0)
    {
        // First query: count total
        $this->db->select('COUNT(DISTINCT b.id) AS cnt');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->_apply_filters($filters);
        $total = (int) $this->db->get()->row()->cnt;

        // Second query: get results
        $this->db->select('
            b.id, b.name, b.slug, b.phone, b.address, b.avg_rating,
            b.total_reviews, b.logo, b.is_verified, b.is_featured, b.is_active,
            b.status, b.owner_user_id, b.latitude, b.longitude,
            c.name AS city_name, c.slug AS city_slug,
            l.name AS locality_name, l.slug AS locality_slug
        ');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->_apply_filters($filters);

        // Apply sorting
        $sort_by = isset($filters['sort_by']) ? $filters['sort_by'] : 'default';
        $sort_dir = isset($filters['sort_dir']) && strtoupper($filters['sort_dir']) === 'ASC' ? 'ASC' : 'DESC';
        if ($sort_by === 'default') {
            $this->db->order_by('b.is_verified', 'DESC');
            $this->db->order_by('b.avg_rating', 'DESC');
        } else {
            $this->db->order_by($sort_by, $sort_dir);
        }

        $this->db->limit($limit, $offset);

        $businesses = $this->db->get()->result();

        // Attach categories and service areas for each business
        foreach ($businesses as &$biz) {
            $biz->categories = $this->_get_business_categories($biz->id);
            $biz->service_areas = $this->_get_service_areas($biz->id);
        }

        return array(
            'businesses' => $businesses,
            'total'      => $total
        );
    }

    /**
     * Fulltext search across business name, description, address.
     */
    public function search($query, $filters = array(), $limit = 20, $offset = 0)
    {
        // Use LIKE-based search as a safe fallback (FULLTEXT may not be indexed)
        $like_query = '%' . $query . '%';

        // Geo scope
        $geo = $this->_get_geo_scope();
        $geo_state_id = NULL;
        if ($geo === 'telangana') {
            $ts = $this->db->where('slug', 'telangana')->get('states')->row();
            if ($ts) $geo_state_id = $ts->id;
        }

        // Count total
        $this->db->select('COUNT(DISTINCT b.id) AS cnt');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->db->group_start();
        $this->db->like('b.name', $query);
        $this->db->or_like('b.description', $query);
        $this->db->or_like('b.address', $query);
        $escaped_q = $this->db->escape_like_str($query);
        $this->db->or_where("b.id IN (SELECT bc.business_id FROM business_categories bc JOIN categories cat ON cat.id = bc.category_id WHERE cat.name LIKE '%{$escaped_q}%')", NULL, FALSE);
        $this->db->or_where("b.id IN (SELECT s.business_id FROM services s WHERE s.name LIKE '%{$escaped_q}%' AND s.is_active = 1)", NULL, FALSE);
        $this->db->group_end();
        $this->db->where('b.status', 'approved');
        $this->db->where('b.is_active', 1);
        if ($geo_state_id) $this->db->where('b.state_id', $geo_state_id);

        if ( ! empty($filters['city_slug'])) {
            $esc = $this->db->escape($filters['city_slug']);
            $this->db->where("(c.slug = {$esc} OR b.id IN (SELECT bsa.business_id FROM business_service_areas bsa JOIN cities sc ON sc.id = bsa.city_id WHERE sc.slug = {$esc} AND bsa.is_active = 1))", NULL, FALSE);
        }
        if ( ! empty($filters['category_slug'])) {
            $this->db->join('business_categories bc', 'bc.business_id = b.id');
            $this->db->join('categories cat', 'cat.id = bc.category_id');
            $this->db->where('cat.slug', $filters['category_slug']);
        }

        $total = (int) $this->db->get()->row()->cnt;

        // Get results
        $this->db->select('
            b.id, b.name, b.slug, b.phone, b.address, b.avg_rating,
            b.total_reviews, b.logo, b.is_verified,
            c.name AS city_name, c.slug AS city_slug,
            l.name AS locality_name, l.slug AS locality_slug
        ');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->join('localities l', 'l.id = b.locality_id', 'left');
        $this->db->group_start();
        $this->db->like('b.name', $query);
        $this->db->or_like('b.description', $query);
        $this->db->or_like('b.address', $query);
        $escaped_q = $this->db->escape_like_str($query);
        $this->db->or_where("b.id IN (SELECT bc.business_id FROM business_categories bc JOIN categories cat ON cat.id = bc.category_id WHERE cat.name LIKE '%{$escaped_q}%')", NULL, FALSE);
        $this->db->or_where("b.id IN (SELECT s.business_id FROM services s WHERE s.name LIKE '%{$escaped_q}%' AND s.is_active = 1)", NULL, FALSE);
        $this->db->group_end();
        $this->db->where('b.status', 'approved');
        $this->db->where('b.is_active', 1);
        if ($geo_state_id) $this->db->where('b.state_id', $geo_state_id);

        if ( ! empty($filters['city_slug'])) {
            $esc2 = $this->db->escape($filters['city_slug']);
            $this->db->where("(c.slug = {$esc2} OR b.id IN (SELECT bsa.business_id FROM business_service_areas bsa JOIN cities sc ON sc.id = bsa.city_id WHERE sc.slug = {$esc2} AND bsa.is_active = 1))", NULL, FALSE);
        }
        if ( ! empty($filters['category_slug'])) {
            $this->db->join('business_categories bc2', 'bc2.business_id = b.id');
            $this->db->join('categories cat2', 'cat2.id = bc2.category_id');
            $this->db->where('cat2.slug', $filters['category_slug']);
        }

        $this->db->order_by('b.is_verified', 'DESC');
        $this->db->order_by('b.avg_rating', 'DESC');
        $this->db->limit($limit, $offset);

        $businesses = $this->db->get()->result();

        foreach ($businesses as &$biz) {
            $biz->categories = $this->_get_business_categories($biz->id);
            $biz->service_areas = $this->_get_service_areas($biz->id);
        }

        return array(
            'businesses' => $businesses,
            'total'      => $total
        );
    }

    /**
     * Create a new business.
     *
     * @param array $data
     * @return int|false  Inserted ID or false
     */
    public function create($data)
    {
        $insert = array(
            'name'              => $data['name'],
            'slug'              => unique_slug($data['name'], $this->table),
            'description'       => isset($data['description']) ? $data['description'] : '',
            'short_description' => isset($data['short_description']) ? $data['short_description'] : NULL,
            'phone'             => isset($data['phone']) ? $data['phone'] : '',
            'mobile'            => isset($data['mobile']) ? $data['mobile'] : '',
            'email'             => isset($data['email']) ? $data['email'] : '',
            'website'           => isset($data['website']) ? $data['website'] : '',
            'address'           => isset($data['address']) ? $data['address'] : '',
            'city_id'           => isset($data['city_id']) ? (int) $data['city_id'] : NULL,
            'state_id'          => isset($data['state_id']) ? (int) $data['state_id'] : $this->_derive_state_from_city(isset($data['city_id']) ? (int) $data['city_id'] : NULL),
            'locality_id'       => isset($data['locality_id']) ? (int) $data['locality_id'] : NULL,
            'pin_code'          => isset($data['pin_code']) ? $data['pin_code'] : '',
            'latitude'          => isset($data['latitude']) ? $data['latitude'] : NULL,
            'longitude'         => isset($data['longitude']) ? $data['longitude'] : NULL,
            'owner_user_id'     => isset($data['owner_user_id']) ? (int) $data['owner_user_id'] : NULL,
            'status'            => isset($data['status']) ? $data['status'] : 'pending',
            'is_verified'       => 0,
            'avg_rating'        => 0,
            'total_reviews'     => 0,
            'year_established'  => isset($data['year_established']) ? $data['year_established'] : NULL,
            'business_hours'    => isset($data['business_hours']) ? json_encode($data['business_hours']) : NULL,
            'social_links'      => isset($data['social_links']) ? json_encode($data['social_links']) : NULL,
            'meta_title'        => isset($data['meta_title']) ? $data['meta_title'] : NULL,
            'meta_description'  => isset($data['meta_description']) ? $data['meta_description'] : NULL,
            'created_at'        => date('Y-m-d H:i:s'),
            'updated_at'        => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        $business_id = $this->db->insert_id();

        if ($business_id && ! empty($data['category_ids'])) {
            $this->_sync_categories($business_id, $data['category_ids']);
        }

        if ($business_id) {
            $this->reindex_to_es($business_id);
        }

        return $business_id ?: FALSE;
    }

    /**
     * Update an existing business.
     *
     * @param int   $id
     * @param array $data
     * @return bool
     */
    public function update($id, $data)
    {
        $allowed = array(
            'name', 'slug', 'description', 'short_description', 'phone', 'mobile',
            'email', 'website', 'address', 'city_id', 'state_id', 'locality_id',
            'pin_code', 'latitude', 'longitude', 'status', 'is_verified',
            'is_featured', 'is_active', 'owner_user_id', 'logo', 'cover_image',
            'year_established', 'meta_title', 'meta_description'
        );

        $update = array();
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        // Auto-generate slug from name only if slug not explicitly provided
        if (isset($data['name']) && ! isset($data['slug'])) {
            $update['slug'] = unique_slug($data['name'], $this->table, 'slug', $id);
        }

        // Auto-derive state_id from city_id when city changes but state isn't explicitly provided
        if (isset($data['city_id']) && ! isset($data['state_id'])) {
            $derived = $this->_derive_state_from_city((int) $data['city_id']);
            if ($derived) {
                $update['state_id'] = $derived;
            }
        }

        // When a business is approved, auto-activate it (unless caller explicitly passed is_active)
        if (isset($data['status']) && $data['status'] === 'approved' && ! array_key_exists('is_active', $data)) {
            $update['is_active'] = 1;
        }
        // When a business is rejected/suspended, auto-deactivate it
        if (isset($data['status']) && in_array($data['status'], array('rejected', 'suspended'), TRUE) && ! array_key_exists('is_active', $data)) {
            $update['is_active'] = 0;
        }

        // Handle JSON fields — accept both string and array
        // Frontend may send "opening_hours" but DB column is "business_hours"
        $bh = isset($data['opening_hours']) ? $data['opening_hours'] : (isset($data['business_hours']) ? $data['business_hours'] : NULL);
        if ($bh !== NULL) {
            $update['business_hours'] = is_string($bh) ? $bh : json_encode($bh);
        }
        if (isset($data['social_links'])) {
            $val = $data['social_links'];
            $update['social_links'] = is_string($val) ? $val : json_encode($val);
        }

        $update['updated_at'] = date('Y-m-d H:i:s');

        $this->db->where('id', $id);
        $result = $this->db->update($this->table, $update);

        if ( ! empty($data['category_ids'])) {
            $this->_sync_categories($id, $data['category_ids']);
        }

        if (isset($data['service_area_ids'])) {
            $this->sync_service_areas($id, $data['service_area_ids']);
        }

        $this->reindex_to_es($id);

        return $result;
    }

    /**
     * Recalculate and update average rating for a business from its approved reviews.
     */
    public function update_rating($business_id)
    {
        $result = $this->db->select('AVG(rating) AS avg_rating, COUNT(*) AS total_reviews')
            ->from('reviews')
            ->where('business_id', $business_id)
            ->where('is_approved', 1)
            ->get()
            ->row();

        $avg = $result->avg_rating ? round($result->avg_rating, 1) : 0;
        $count = (int) $result->total_reviews;

        $this->db->where('id', $business_id);
        $this->db->update($this->table, array(
            'avg_rating'    => $avg,
            'total_reviews' => $count,
            'updated_at'    => date('Y-m-d H:i:s')
        ));

        $this->reindex_to_es($business_id);

        return array('avg_rating' => $avg, 'total_reviews' => $count);
    }

    /**
     * Get businesses owned by a specific user.
     */
    public function get_by_user($user_id)
    {
        $this->db->select('b.*, c.name AS city_name, c.slug AS city_slug');
        $this->db->from('businesses b');
        $this->db->join('cities c', 'c.id = b.city_id', 'left');
        $this->db->where('b.owner_user_id', $user_id);
        $this->db->order_by('b.created_at', 'DESC');

        $businesses = $this->db->get()->result();
        foreach ($businesses as &$biz) {
            $biz->categories = $this->_get_business_categories($biz->id);
        }

        return $businesses;
    }

    /**
     * Get all business slugs for sitemap generation.
     */
    public function get_all_slugs()
    {
        return $this->db->select('slug, updated_at')
            ->from($this->table)
            ->where('status', 'approved')
            ->order_by('updated_at', 'DESC')
            ->get()
            ->result();
    }

    /**
     * Look up the state_id for a given city_id. Returns NULL if city not found.
     */
    private function _derive_state_from_city($city_id)
    {
        if ( ! $city_id) {
            return NULL;
        }
        $row = $this->db->select('state_id')->from('cities')->where('id', $city_id)->get()->row();
        return $row ? (int) $row->state_id : NULL;
    }

    /**
     * Backfill state_id for any business that has a city but a missing/wrong state.
     * Returns the number of rows updated.
     */
    public function backfill_state_ids()
    {
        $sql = "
            UPDATE businesses b
            INNER JOIN cities c ON c.id = b.city_id
            SET b.state_id = c.state_id
            WHERE b.city_id IS NOT NULL
            AND (b.state_id IS NULL OR b.state_id != c.state_id)
        ";
        $this->db->query($sql);
        return $this->db->affected_rows();
    }

    /**
     * Apply listing filters to the query builder.
     */
    private function _apply_filters($filters)
    {
        if ( ! isset($filters['status'])) {
            $this->db->where('b.status', 'approved');
            $this->db->where('b.is_active', 1);
        } elseif ($filters['status'] !== 'all') {
            $this->db->where('b.status', $filters['status']);
        }
        // 'all' = no status filter (admin sees everything)

        // Geo scope filter — restrict to specific state if set
        if ( ! isset($filters['skip_geo'])) {
            $geo = $this->_get_geo_scope();
            if ($geo === 'telangana') {
                $state_id = $this->_get_telangana_state_id();
                if ($state_id) {
                    $this->db->where('b.state_id', $state_id);
                }
            }
        }

        if ( ! empty($filters['city_slug'])) {
            // Check both home city AND service areas
            $escaped = $this->db->escape($filters['city_slug']);
            $this->db->where("(c.slug = {$escaped} OR b.id IN (SELECT bsa.business_id FROM business_service_areas bsa JOIN cities sc ON sc.id = bsa.city_id WHERE sc.slug = {$escaped} AND bsa.is_active = 1))", NULL, FALSE);
        }

        if ( ! empty($filters['locality_slug'])) {
            $this->db->where('l.slug', $filters['locality_slug']);
        }

        if ( ! empty($filters['category_slug'])) {
            $this->db->join('business_categories bc', 'bc.business_id = b.id');
            $this->db->join('categories cat', 'cat.id = bc.category_id');
            $this->db->where('cat.slug', $filters['category_slug']);
        }

        if ( ! empty($filters['user_id'])) {
            $this->db->where('b.owner_user_id', $filters['user_id']);
        }

        if ( ! empty($filters['is_verified'])) {
            $this->db->where('b.is_verified', 1);
        }

        if ( ! empty($filters['min_rating'])) {
            $this->db->where('b.avg_rating >=', (float) $filters['min_rating']);
        }
    }

    /**
     * Get current geo scope from settings (uses raw query to avoid query builder conflicts).
     */
    private function _get_geo_scope()
    {
        $result = $this->db->query("SELECT setting_value FROM settings WHERE setting_key = 'geo_scope' LIMIT 1")->row();
        return $result ? $result->setting_value : 'india';
    }

    /**
     * Get Telangana state ID (cached).
     */
    private $_telangana_id = NULL;
    private function _get_telangana_state_id()
    {
        if ($this->_telangana_id === NULL) {
            $row = $this->db->query("SELECT id FROM states WHERE slug = 'telangana' LIMIT 1")->row();
            $this->_telangana_id = $row ? $row->id : 0;
        }
        return $this->_telangana_id;
    }

    /**
     * Get categories for a business.
     */
    public function _get_business_categories($business_id)
    {
        return $this->db->select('cat.id, cat.name, cat.slug, cat.icon, bc.is_primary')
            ->from('business_categories bc')
            ->join('categories cat', 'cat.id = bc.category_id')
            ->where('bc.business_id', $business_id)
            ->order_by('bc.is_primary', 'DESC')
            ->get()
            ->result();
    }

    /**
     * Get images for a business.
     */
    private function _get_business_images($business_id)
    {
        return $this->db->select('id, image_url, alt_text, sort_order')
            ->from('business_images')
            ->where('business_id', $business_id)
            ->order_by('sort_order', 'ASC')
            ->get()
            ->result();
    }

    /**
     * Sync business-category pivot table.
     */
    public function _sync_categories($business_id, $category_ids)
    {
        $this->db->where('business_id', $business_id);
        $this->db->delete('business_categories');

        $is_first = TRUE;
        foreach ($category_ids as $cat_id) {
            $this->db->insert('business_categories', array(
                'business_id' => $business_id,
                'category_id' => (int) $cat_id,
                'is_primary'  => $is_first ? 1 : 0,
            ));
            $is_first = FALSE;
        }

        $this->reindex_to_es($business_id);
    }

    /**
     * Get services for a business, grouped by category.
     * Returns: [ { category_id, category_name, category_slug, services: [...] }, ... ]
     */
    public function _get_services_grouped($business_id)
    {
        $services = $this->db->select('s.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon')
            ->from('services s')
            ->join('categories c', 'c.id = s.category_id', 'left')
            ->where('s.business_id', $business_id)
            ->where('s.is_active', 1)
            ->order_by('c.sort_order', 'ASC')
            ->order_by('s.name', 'ASC')
            ->get()->result();

        $grouped = array();
        foreach ($services as $svc) {
            $cat_id = $svc->category_id ?: 0;
            if ( ! isset($grouped[$cat_id])) {
                $grouped[$cat_id] = array(
                    'category_id'   => $cat_id,
                    'category_name' => $svc->category_name ?: 'Other',
                    'category_slug' => $svc->category_slug ?: 'other',
                    'category_icon' => $svc->category_icon ?: NULL,
                    'services'      => array(),
                );
            }
            // Remove redundant category fields from service
            unset($svc->category_name, $svc->category_slug, $svc->category_icon);
            $grouped[$cat_id]['services'][] = $svc;
        }

        return array_values($grouped);
    }
}
