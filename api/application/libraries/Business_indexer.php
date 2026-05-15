<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Indexes businesses (and their categories, services, service areas) into Elasticsearch.
 */
class Business_indexer
{
    /** @var CI_Controller */
    private $CI;

    public function __construct()
    {
        $this->CI =& get_instance();
        $this->CI->load->library('Elasticsearch_lib', NULL, 'es');
    }

    public function index_name()
    {
        return $this->CI->es->index_name('businesses');
    }

    /**
     * Index mapping. Tuned for autocomplete + multi-field search.
     */
    public function mapping()
    {
        return array(
            'settings' => array(
                'analysis' => array(
                    'analyzer' => array(
                        'edge_ngram_analyzer' => array(
                            'tokenizer' => 'standard',
                            'filter'    => array('lowercase', 'edge_ngram_filter'),
                        ),
                    ),
                    'filter' => array(
                        'edge_ngram_filter' => array(
                            'type'     => 'edge_ngram',
                            'min_gram' => 2,
                            'max_gram' => 20,
                        ),
                    ),
                ),
            ),
            'mappings' => array(
                'properties' => array(
                    'id'              => array('type' => 'long'),
                    'name'            => array(
                        'type'            => 'text',
                        'analyzer'        => 'edge_ngram_analyzer',
                        'search_analyzer' => 'standard',
                        'fields'          => array('keyword' => array('type' => 'keyword')),
                    ),
                    'slug'            => array('type' => 'keyword'),
                    'phone'           => array('type' => 'keyword'),
                    'description'     => array('type' => 'text'),
                    'short_description' => array('type' => 'text'),
                    'address'         => array('type' => 'text'),
                    'pin_code'        => array('type' => 'keyword'),
                    'logo'            => array('type' => 'keyword', 'index' => FALSE),

                    'status'          => array('type' => 'keyword'),
                    'is_active'       => array('type' => 'boolean'),
                    'is_verified'     => array('type' => 'boolean'),
                    'is_featured'     => array('type' => 'boolean'),

                    'avg_rating'      => array('type' => 'float'),
                    'total_reviews'   => array('type' => 'integer'),

                    'city_id'         => array('type' => 'long'),
                    'city_name'       => array('type' => 'text', 'fields' => array('keyword' => array('type' => 'keyword'))),
                    'city_slug'       => array('type' => 'keyword'),
                    'state_id'        => array('type' => 'long'),
                    'state_slug'      => array('type' => 'keyword'),
                    'locality_id'     => array('type' => 'long'),
                    'locality_name'   => array('type' => 'text'),
                    'locality_slug'   => array('type' => 'keyword'),

                    'location'        => array('type' => 'geo_point'),

                    'category_names'  => array('type' => 'text', 'fields' => array('keyword' => array('type' => 'keyword'))),
                    'category_slugs'  => array('type' => 'keyword'),

                    'service_names'   => array('type' => 'text'),

                    'service_area_city_slugs' => array('type' => 'keyword'),

                    'created_at'      => array('type' => 'date'),
                    'updated_at'      => array('type' => 'date'),
                ),
            ),
        );
    }

    /**
     * Drop and recreate the index. Returns ['ok' => bool, 'error' => string|null].
     */
    public function setup_index($drop = FALSE)
    {
        $name = $this->index_name();

        if ($drop && $this->CI->es->index_exists($name)) {
            if ( ! $this->CI->es->delete_index($name)) {
                return array('ok' => FALSE, 'error' => $this->CI->es->last_error());
            }
        }

        if ( ! $this->CI->es->index_exists($name)) {
            if ( ! $this->CI->es->create_index($name, $this->mapping())) {
                return array('ok' => FALSE, 'error' => $this->CI->es->last_error());
            }
        }

        return array('ok' => TRUE, 'error' => NULL);
    }

    /**
     * Build the ES document for a single business id. Returns NULL if not found.
     */
    public function build_doc($business_id)
    {
        $db = $this->CI->db;

        $b = $db->select('
                b.id, b.name, b.slug, b.phone, b.description, b.short_description,
                b.address, b.pin_code, b.logo,
                b.status, b.is_active, b.is_verified, b.is_featured,
                b.avg_rating, b.total_reviews,
                b.city_id, b.state_id, b.locality_id,
                b.latitude, b.longitude,
                b.created_at, b.updated_at,
                c.name AS city_name, c.slug AS city_slug,
                s.slug AS state_slug,
                l.name AS locality_name, l.slug AS locality_slug
            ')
            ->from('businesses b')
            ->join('cities c', 'c.id = b.city_id', 'left')
            ->join('states s', 's.id = b.state_id', 'left')
            ->join('localities l', 'l.id = b.locality_id', 'left')
            ->where('b.id', (int) $business_id)
            ->get()
            ->row();

        if ( ! $b) return NULL;

        // Categories
        $cats = $db->select('cat.name, cat.slug')
            ->from('business_categories bc')
            ->join('categories cat', 'cat.id = bc.category_id')
            ->where('bc.business_id', $b->id)
            ->get()->result();

        $category_names = array();
        $category_slugs = array();
        foreach ($cats as $c) {
            $category_names[] = $c->name;
            $category_slugs[] = $c->slug;
        }

        // Services
        $svcs = $db->select('name')
            ->from('services')
            ->where('business_id', $b->id)
            ->where('is_active', 1)
            ->get()->result();

        $service_names = array();
        foreach ($svcs as $s) {
            $service_names[] = $s->name;
        }

        // Service areas
        $areas = $db->select('c.slug')
            ->from('business_service_areas bsa')
            ->join('cities c', 'c.id = bsa.city_id')
            ->where('bsa.business_id', $b->id)
            ->where('bsa.is_active', 1)
            ->get()->result();

        $area_slugs = array();
        foreach ($areas as $a) {
            $area_slugs[] = $a->slug;
        }

        $doc = array(
            'id'                => (int) $b->id,
            'name'              => $b->name,
            'slug'              => $b->slug,
            'phone'             => $b->phone,
            'description'       => $b->description,
            'short_description' => $b->short_description,
            'address'           => $b->address,
            'pin_code'          => $b->pin_code,
            'logo'              => $b->logo,
            'status'            => $b->status,
            'is_active'         => (bool) $b->is_active,
            'is_verified'       => (bool) $b->is_verified,
            'is_featured'       => (bool) $b->is_featured,
            'avg_rating'        => (float) $b->avg_rating,
            'total_reviews'     => (int) $b->total_reviews,
            'city_id'           => $b->city_id ? (int) $b->city_id : NULL,
            'city_name'         => $b->city_name,
            'city_slug'         => $b->city_slug,
            'state_id'          => $b->state_id ? (int) $b->state_id : NULL,
            'state_slug'        => $b->state_slug,
            'locality_id'       => $b->locality_id ? (int) $b->locality_id : NULL,
            'locality_name'     => $b->locality_name,
            'locality_slug'     => $b->locality_slug,
            'category_names'    => $category_names,
            'category_slugs'    => $category_slugs,
            'service_names'     => $service_names,
            'service_area_city_slugs' => $area_slugs,
            'created_at'        => $this->_to_iso($b->created_at),
            'updated_at'        => $this->_to_iso($b->updated_at),
        );

        if ($b->latitude !== NULL && $b->longitude !== NULL && (float) $b->latitude !== 0.0) {
            $doc['location'] = array(
                'lat' => (float) $b->latitude,
                'lon' => (float) $b->longitude,
            );
        }

        return $doc;
    }

    /**
     * Index a single business. Returns TRUE on success.
     */
    public function index_one($business_id)
    {
        $doc = $this->build_doc($business_id);
        if ( ! $doc) return FALSE;
        return $this->CI->es->index_doc($this->index_name(), $doc['id'], $doc);
    }

    public function delete_one($business_id)
    {
        return $this->CI->es->delete_doc($this->index_name(), (int) $business_id);
    }

    /**
     * Reindex all businesses in batches. Returns counters.
     */
    public function reindex_all($batch_size = 200)
    {
        $name = $this->index_name();
        $db = $this->CI->db;

        $total = (int) $db->select('COUNT(*) AS cnt')->from('businesses')->get()->row()->cnt;

        $processed = 0;
        $indexed   = 0;
        $errors    = array();
        $offset    = 0;

        while ($offset < $total) {
            $rows = $db->select('id')
                ->from('businesses')
                ->order_by('id', 'ASC')
                ->limit($batch_size, $offset)
                ->get()->result();

            if (empty($rows)) break;

            $docs = array();
            foreach ($rows as $r) {
                $doc = $this->build_doc((int) $r->id);
                if ($doc) {
                    $docs[] = array('id' => $doc['id'], 'body' => $doc);
                }
                $processed++;
            }

            if ( ! empty($docs)) {
                $res = $this->CI->es->bulk_index($name, $docs);
                $indexed += $res['indexed'];
                if ( ! empty($res['errors'])) {
                    $errors = array_merge($errors, array_slice($res['errors'], 0, 5));
                }
            }

            $offset += $batch_size;
        }

        $this->CI->es->refresh($name);

        return array(
            'total'     => $total,
            'processed' => $processed,
            'indexed'   => $indexed,
            'errors'    => $errors,
        );
    }

    private function _to_iso($dt)
    {
        if (empty($dt) || $dt === '0000-00-00 00:00:00') return NULL;
        $ts = strtotime($dt);
        return $ts ? date('c', $ts) : NULL;
    }

    // -------------------------------------------------------------------------
    // Read-side: query builders
    // -------------------------------------------------------------------------

    /**
     * Free-text search across business name, description, services, etc.
     * Returns ['ids' => [...], 'total' => int] preserving ES relevance order, or NULL on failure.
     */
    public function text_search($query, array $filters, $per_page, $offset)
    {
        $index = $this->index_name();
        if ( ! $this->CI->es->index_exists($index)) return NULL;

        $body = array(
            'from' => (int) $offset,
            'size' => (int) $per_page,
            'track_total_hits' => TRUE,
            '_source' => array('id'),
            'query' => array(
                'bool' => array(
                    'filter' => $this->_base_filters($filters),
                    'must'   => array(
                        array(
                            'multi_match' => array(
                                'query'  => $query,
                                'type'   => 'best_fields',
                                'fields' => array(
                                    'name^4',
                                    'category_names^3',
                                    'service_names^2',
                                    'short_description^1.5',
                                    'description',
                                    'address',
                                    'city_name',
                                    'locality_name',
                                ),
                                'fuzziness' => 'AUTO',
                            ),
                        ),
                    ),
                ),
            ),
            'sort' => array(
                '_score',
                array('is_verified' => array('order' => 'desc')),
                array('avg_rating'  => array('order' => 'desc')),
            ),
        );

        return $this->_run($index, $body);
    }

    /**
     * Filtered listing — no free-text query. $sort: 'rating' | 'name' | 'newest' | 'reviews' | 'default'.
     * Returns ['ids' => [...], 'total' => int] or NULL on failure.
     */
    public function list_search(array $filters, $sort, $per_page, $offset)
    {
        $index = $this->index_name();
        if ( ! $this->CI->es->index_exists($index)) return NULL;

        $body = array(
            'from' => (int) $offset,
            'size' => (int) $per_page,
            'track_total_hits' => TRUE,
            '_source' => array('id'),
            'query' => array(
                'bool' => array(
                    'filter' => $this->_base_filters($filters),
                    'must'   => array(array('match_all' => new \stdClass())),
                ),
            ),
            'sort' => $this->_sort_clause($sort),
        );

        return $this->_run($index, $body);
    }

    private function _run($index, array $body)
    {
        $res = $this->CI->es->search($index, $body);
        if ($res === NULL) return NULL;

        $hits = isset($res['hits']['hits']) ? $res['hits']['hits'] : array();
        $ids  = array();
        foreach ($hits as $h) {
            if (isset($h['_source']['id'])) $ids[] = (int) $h['_source']['id'];
            elseif (isset($h['_id']))       $ids[] = (int) $h['_id'];
        }

        return array(
            'ids'   => $ids,
            'total' => isset($res['hits']['total']['value']) ? (int) $res['hits']['total']['value'] : 0,
        );
    }

    /**
     * Translate the same filter keys used by Business_model::get_listing/_apply_filters
     * into an ES bool-filter clause.
     *
     * Supported keys: status ('all' = no filter; default = approved+active),
     *                 skip_geo (bool), city_slug, locality_slug, category_slug,
     *                 user_id, is_verified, min_rating.
     */
    private function _base_filters(array $filters)
    {
        $out = array();

        // Status: default to approved+active unless caller asks for 'all' or a specific status
        $status = isset($filters['status']) ? $filters['status'] : NULL;
        if ($status === NULL) {
            $out[] = array('term' => array('status'    => 'approved'));
            $out[] = array('term' => array('is_active' => TRUE));
        } elseif ($status !== 'all') {
            $out[] = array('term' => array('status' => $status));
        }

        // Geo scope: match Business_model::_get_geo_scope()
        if (empty($filters['skip_geo'])) {
            $geo = $this->_geo_scope();
            if ($geo === 'telangana') {
                $out[] = array('term' => array('state_slug' => 'telangana'));
            }
        }

        if ( ! empty($filters['city_slug'])) {
            $out[] = array(
                'bool' => array(
                    'should' => array(
                        array('term' => array('city_slug' => $filters['city_slug'])),
                        array('term' => array('service_area_city_slugs' => $filters['city_slug'])),
                    ),
                    'minimum_should_match' => 1,
                ),
            );
        }

        if ( ! empty($filters['locality_slug'])) {
            $out[] = array('term' => array('locality_slug' => $filters['locality_slug']));
        }

        if ( ! empty($filters['category_slug'])) {
            $out[] = array('term' => array('category_slugs' => $filters['category_slug']));
        }

        if ( ! empty($filters['user_id'])) {
            // owner_user_id isn't in the mapping today — listings filtering by owner
            // are rare (admin-only) and fall through to MySQL via the controller.
            // We intentionally skip this in ES.
        }

        if ( ! empty($filters['is_verified'])) {
            $out[] = array('term' => array('is_verified' => TRUE));
        }

        if (isset($filters['min_rating']) && $filters['min_rating'] !== '' && $filters['min_rating'] !== NULL) {
            $out[] = array('range' => array('avg_rating' => array('gte' => (float) $filters['min_rating'])));
        }

        return $out;
    }

    private function _sort_clause($sort)
    {
        switch ($sort) {
            case 'rating':
                return array(array('avg_rating' => array('order' => 'desc')));
            case 'name':
                return array(array('name.keyword' => array('order' => 'asc')));
            case 'newest':
                return array(array('created_at' => array('order' => 'desc')));
            case 'reviews':
                return array(array('total_reviews' => array('order' => 'desc')));
            case 'default':
            default:
                return array(
                    array('is_verified' => array('order' => 'desc')),
                    array('avg_rating'  => array('order' => 'desc')),
                );
        }
    }

    private function _geo_scope()
    {
        $row = $this->CI->db->query("SELECT setting_value FROM settings WHERE setting_key = 'geo_scope' LIMIT 1")->row();
        return $row ? $row->setting_value : 'india';
    }
}
