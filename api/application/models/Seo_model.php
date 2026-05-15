<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Seo_model extends CI_Model
{
    protected $table = 'seo_meta';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get SEO meta data for a specific page type and identifier.
     *
     * @param string $page_type  E.g. 'city', 'category', 'business', 'city_category', 'home'
     * @param string $slug       The slug or composite identifier
     * @return object|null
     */
    public function get_meta($page_type, $slug = NULL)
    {
        // First check for custom meta stored in seo_meta table
        $this->db->where('page_type', $page_type);
        if ($slug !== NULL) {
            $this->db->where('reference_slug', $slug);
        } else {
            $this->db->where('reference_slug', '');
        }

        $meta = $this->db->get($this->table)->row();

        if ($meta) {
            return (object) array(
                'title'            => $meta->meta_title,
                'description'      => $meta->meta_description,
                'og_title'         => $meta->og_title ?: $meta->meta_title,
                'og_description'   => $meta->og_description ?: $meta->meta_description,
                'og_image'         => $meta->og_image,
                'canonical_url'    => $meta->canonical_url,
                'h1_override'      => $meta->h1_override,
                'no_index'         => (int) $meta->no_index,
                'schema_markup'    => $meta->additional_schema ? json_decode($meta->additional_schema) : NULL,
            );
        }

        // Fall back to auto-generated meta
        return $this->generate_default_meta($page_type, $slug);
    }

    /**
     * Generate default SEO meta from entity data when no custom meta exists.
     */
    public function generate_default_meta($page_type, $slug = NULL)
    {
        $site_name = 'Servora';
        $base_url = 'http://localhost:3000';

        switch ($page_type) {
            case 'home':
                return (object) array(
                    'title'          => $site_name . ' - Find Home Services Near You',
                    'description'    => 'Find the best home services, plumbers, electricians, AC repair, cleaning and more near you. Read reviews, compare ratings, and get quotes.',
                    'og_title'       => $site_name . ' - Find Home Services Near You',
                    'og_description' => 'Find the best home services near you.',
                    'og_image'       => NULL,
                    'canonical_url'  => $base_url,
                    'h1_override'    => NULL,
                    'no_index'       => 0,
                    'schema_markup'  => NULL,
                );

            case 'city':
                $this->load->model('City_model');
                $city = $this->City_model->get_by_slug($slug);
                if ( ! $city) {
                    return $this->_fallback_meta();
                }
                return (object) array(
                    'title'          => 'Home Services in ' . $city->name . ' - ' . $site_name,
                    'description'    => 'Find top-rated home services, plumbers, electricians, and cleaning in ' . $city->name . '. ' . $city->business_count . ' businesses listed.',
                    'og_title'       => 'Home Services in ' . $city->name,
                    'og_description' => 'Find top-rated home services in ' . $city->name,
                    'og_image'       => NULL,
                    'canonical_url'  => $base_url . '/' . $slug,
                    'h1_override'    => NULL,
                    'no_index'       => 0,
                    'schema_markup'  => NULL,
                );

            case 'category':
                $this->load->model('Category_model');
                $cat = $this->Category_model->get_by_slug($slug);
                if ( ! $cat) {
                    return $this->_fallback_meta();
                }
                return (object) array(
                    'title'          => $cat->name . ' Services - ' . $site_name,
                    'description'    => 'Find the best ' . strtolower($cat->name) . ' services. Browse ' . $cat->business_count . ' verified businesses with reviews and ratings.',
                    'og_title'       => $cat->name . ' Services',
                    'og_description' => 'Find the best ' . strtolower($cat->name) . ' services near you.',
                    'og_image'       => NULL,
                    'canonical_url'  => $base_url . '/categories/' . $slug,
                    'h1_override'    => NULL,
                    'no_index'       => 0,
                    'schema_markup'  => NULL,
                );

            case 'business':
                $this->load->model('Business_model');
                $biz = $this->Business_model->get_by_slug($slug);
                if ( ! $biz) {
                    return $this->_fallback_meta();
                }
                $location = '';
                if ( ! empty($biz->locality_name)) {
                    $location = $biz->locality_name . ', ';
                }
                $location .= ! empty($biz->city_name) ? $biz->city_name : '';

                $schema = array(
                    '@context' => 'https://schema.org',
                    '@type'    => 'LocalBusiness',
                    'name'     => $biz->name,
                    'address'  => array(
                        '@type'           => 'PostalAddress',
                        'streetAddress'   => $biz->address,
                        'addressLocality' => ! empty($biz->city_name) ? $biz->city_name : '',
                        'addressRegion'   => ! empty($biz->state_name) ? $biz->state_name : '',
                    ),
                    'telephone'       => $biz->phone,
                    'aggregateRating' => array(
                        '@type'       => 'AggregateRating',
                        'ratingValue' => $biz->avg_rating,
                        'reviewCount' => $biz->total_reviews,
                    ),
                );

                return (object) array(
                    'title'          => $biz->name . ' - ' . $location . ' | ' . $site_name,
                    'description'    => 'Visit ' . $biz->name . ' in ' . $location . '. Rated ' . $biz->avg_rating . '/5 based on ' . $biz->total_reviews . ' reviews. Contact: ' . $biz->phone,
                    'og_title'       => $biz->name . ' - ' . $location,
                    'og_description' => 'Rated ' . $biz->avg_rating . '/5. ' . $biz->total_reviews . ' reviews.',
                    'og_image'       => $biz->logo,
                    'canonical_url'  => $base_url . '/business/' . $slug,
                    'h1_override'    => NULL,
                    'no_index'       => 0,
                    'schema_markup'  => $schema,
                );

            case 'city_category':
                // slug format: "city-slug/category-slug"
                $parts = explode('/', $slug);
                if (count($parts) !== 2) {
                    return $this->_fallback_meta();
                }
                $this->load->model('City_model');
                $this->load->model('Category_model');
                $city = $this->City_model->get_by_slug($parts[0]);
                $cat = $this->Category_model->get_by_slug($parts[1]);
                if ( ! $city || ! $cat) {
                    return $this->_fallback_meta();
                }
                return (object) array(
                    'title'          => $cat->name . ' in ' . $city->name . ' - ' . $site_name,
                    'description'    => 'Find the best ' . strtolower($cat->name) . ' services in ' . $city->name . '. Compare ratings, read reviews, and contact top providers.',
                    'og_title'       => $cat->name . ' in ' . $city->name,
                    'og_description' => 'Find ' . strtolower($cat->name) . ' services in ' . $city->name,
                    'og_image'       => NULL,
                    'canonical_url'  => $base_url . '/' . $parts[0] . '/' . $parts[1],
                    'h1_override'    => NULL,
                    'no_index'       => 0,
                    'schema_markup'  => NULL,
                );

            default:
                return $this->_fallback_meta();
        }
    }

    /**
     * Get breadcrumb data for a page.
     *
     * @param string $page_type
     * @param string $slug
     * @return array
     */
    public function get_breadcrumbs($page_type, $slug = NULL)
    {
        $base_url = 'http://localhost:3000';
        $crumbs = array(
            array('label' => 'Home', 'url' => $base_url)
        );

        switch ($page_type) {
            case 'city':
                $this->load->model('City_model');
                $city = $this->City_model->get_by_slug($slug);
                if ($city) {
                    $crumbs[] = array('label' => 'Cities', 'url' => $base_url . '/cities');
                    $crumbs[] = array('label' => $city->name, 'url' => NULL);
                }
                break;

            case 'category':
                $this->load->model('Category_model');
                $cat = $this->Category_model->get_by_slug($slug);
                if ($cat) {
                    $crumbs[] = array('label' => 'Categories', 'url' => $base_url . '/categories');
                    if ($cat->parent) {
                        $crumbs[] = array('label' => $cat->parent->name, 'url' => $base_url . '/categories/' . $cat->parent->slug);
                    }
                    $crumbs[] = array('label' => $cat->name, 'url' => NULL);
                }
                break;

            case 'business':
                $this->load->model('Business_model');
                $biz = $this->Business_model->get_by_slug($slug);
                if ($biz) {
                    if ( ! empty($biz->city_name)) {
                        $crumbs[] = array('label' => $biz->city_name, 'url' => $base_url . '/' . $biz->city_slug);
                    }
                    if ( ! empty($biz->locality_name)) {
                        $crumbs[] = array('label' => $biz->locality_name, 'url' => $base_url . '/' . $biz->city_slug . '/' . $biz->locality_slug);
                    }
                    if ( ! empty($biz->categories) && count($biz->categories) > 0) {
                        $first_cat = $biz->categories[0];
                        $crumbs[] = array('label' => $first_cat->name, 'url' => $base_url . '/categories/' . $first_cat->slug);
                    }
                    $crumbs[] = array('label' => $biz->name, 'url' => NULL);
                }
                break;

            case 'city_category':
                $parts = explode('/', $slug);
                if (count($parts) === 2) {
                    $this->load->model('City_model');
                    $this->load->model('Category_model');
                    $city = $this->City_model->get_by_slug($parts[0]);
                    $cat = $this->Category_model->get_by_slug($parts[1]);
                    if ($city) {
                        $crumbs[] = array('label' => $city->name, 'url' => $base_url . '/' . $city->slug);
                    }
                    if ($cat) {
                        $crumbs[] = array('label' => $cat->name, 'url' => NULL);
                    }
                }
                break;
        }

        return $crumbs;
    }

    /**
     * Save custom SEO meta (admin).
     */
    public function save_meta($data)
    {
        $this->db->where('page_type', $data['page_type']);
        if ( ! empty($data['reference_slug'])) {
            $this->db->where('reference_slug', $data['reference_slug']);
        } else {
            $this->db->where('reference_slug', '');
        }

        $existing = $this->db->get($this->table)->row();

        $record = array(
            'page_type'        => $data['page_type'],
            'reference_slug'   => isset($data['reference_slug']) ? $data['reference_slug'] : '',
            'meta_title'       => isset($data['meta_title']) ? $data['meta_title'] : '',
            'meta_description' => isset($data['meta_description']) ? $data['meta_description'] : '',
            'og_title'         => isset($data['og_title']) ? $data['og_title'] : NULL,
            'og_description'   => isset($data['og_description']) ? $data['og_description'] : NULL,
            'og_image'         => isset($data['og_image']) ? $data['og_image'] : NULL,
            'canonical_url'    => isset($data['canonical_url']) ? $data['canonical_url'] : NULL,
            'h1_override'      => isset($data['h1_override']) ? $data['h1_override'] : NULL,
            'no_index'         => ! empty($data['no_index']) ? 1 : 0,
            'additional_schema'=> isset($data['schema_markup']) ? json_encode($data['schema_markup']) : NULL,
            'updated_at'       => date('Y-m-d H:i:s'),
        );

        if ($existing) {
            $this->db->where('id', $existing->id);
            return $this->db->update($this->table, $record);
        }

        $record['created_at'] = date('Y-m-d H:i:s');
        $this->db->insert($this->table, $record);
        return $this->db->insert_id() ? TRUE : FALSE;
    }

    /**
     * Fallback meta for unknown page types.
     */
    private function _fallback_meta()
    {
        return (object) array(
            'title'          => 'Servora - Find Home Services Near You',
            'description'    => 'Find the best home services, plumbers, electricians, AC repair and cleaning near you.',
            'og_title'       => 'Servora',
            'og_description' => 'Find the best home services near you.',
            'og_image'       => NULL,
            'canonical_url'  => NULL,
            'h1_override'    => NULL,
            'no_index'       => 0,
            'schema_markup'  => NULL,
        );
    }
}
