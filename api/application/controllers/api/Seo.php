<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Seo extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Seo_model');
    }

    /**
     * GET /api/seo/meta?page_type=<type>&slug=<slug>
     * Returns meta tags for Next.js head rendering.
     *
     * Supported page_type values:
     *   home, city, category, business, city_category
     */
    public function meta()
    {
        $page_type = $this->input->get('page_type');
        $slug = $this->input->get('slug');

        if (empty($page_type)) {
            $this->respond_error('page_type parameter is required', 422);
        }

        $valid_types = array('home', 'city', 'category', 'business', 'city_category', 'search');
        if ( ! in_array($page_type, $valid_types)) {
            $this->respond_error('Invalid page_type. Allowed: ' . implode(', ', $valid_types), 422);
        }

        $meta = $this->Seo_model->get_meta($page_type, $slug);

        $this->respond($meta);
    }

    /**
     * GET /api/seo/breadcrumbs?page_type=<type>&slug=<slug>
     * Returns breadcrumb array for structured navigation.
     */
    public function breadcrumbs()
    {
        $page_type = $this->input->get('page_type');
        $slug = $this->input->get('slug');

        if (empty($page_type)) {
            $this->respond_error('page_type parameter is required', 422);
        }

        $crumbs = $this->Seo_model->get_breadcrumbs($page_type, $slug);

        // Also generate BreadcrumbList schema
        $schema = array(
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => array(),
        );

        foreach ($crumbs as $i => $crumb) {
            $item = array(
                '@type'    => 'ListItem',
                'position' => $i + 1,
                'name'     => $crumb['label'],
            );
            if ($crumb['url']) {
                $item['item'] = $crumb['url'];
            }
            $schema['itemListElement'][] = $item;
        }

        $this->respond(array(
            'breadcrumbs' => $crumbs,
            'schema'      => $schema,
        ));
    }

    /**
     * GET /api/seo/static-params/:type
     * Returns all possible parameter combinations for Next.js generateStaticParams().
     * Used for ISR/SSG pre-rendering.
     *
     * Supported types: cities, categories, businesses, city-categories, localities
     */
    public function static_params($type)
    {
        $params = array();

        switch ($type) {
            case 'cities':
                $this->load->model('City_model');
                $cities = $this->City_model->get_all_slugs();
                foreach ($cities as $city) {
                    $params[] = array('city' => $city->slug);
                }
                break;

            case 'categories':
                $this->load->model('Category_model');
                $categories = $this->Category_model->get_all_slugs();
                foreach ($categories as $cat) {
                    $params[] = array('category' => $cat->slug);
                }
                break;

            case 'businesses':
                $this->load->model('Business_model');
                $businesses = $this->Business_model->get_all_slugs();
                foreach ($businesses as $biz) {
                    $params[] = array('slug' => $biz->slug);
                }
                break;

            case 'city-categories':
                $this->load->model('City_model');
                $this->load->model('Category_model');
                $cities = $this->City_model->get_all_slugs();
                $categories = $this->Category_model->get_all_slugs();
                foreach ($cities as $city) {
                    foreach ($categories as $cat) {
                        $params[] = array(
                            'city'     => $city->slug,
                            'category' => $cat->slug,
                        );
                    }
                }
                break;

            case 'localities':
                $this->load->model('Locality_model');
                $localities = $this->Locality_model->get_all_slugs();
                foreach ($localities as $loc) {
                    $params[] = array(
                        'city'     => $loc->city_slug,
                        'locality' => $loc->locality_slug,
                    );
                }
                break;

            default:
                $this->respond_error('Invalid type. Allowed: cities, categories, businesses, city-categories, localities', 422);
        }

        $this->respond(array(
            'type'   => $type,
            'params' => $params,
            'count'  => count($params),
        ));
    }
}
