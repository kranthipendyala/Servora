<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sitemap extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Build all sitemap entries from DB grouped by type.
     * Only includes pages backed by approved businesses.
     */
    private function _build_entries()
    {
        $today = date('Y-m-d');
        $entries = array();

        // ── 1. Homepage ──
        $entries[] = array('loc' => '/', 'lastmod' => $today, 'changefreq' => 'daily', 'priority' => 1.0);

        // ── 2. City pages (sorted A-Z) ──
        $cities = $this->db->query("
            SELECT DISTINCT c.slug, c.name FROM cities c WHERE c.is_active = 1 AND (
                EXISTS (SELECT 1 FROM businesses b WHERE b.city_id = c.id AND b.status = 'approved')
                OR EXISTS (
                    SELECT 1 FROM business_service_areas bsa
                    JOIN businesses b ON b.id = bsa.business_id
                    WHERE bsa.city_id = c.id AND bsa.is_active = 1 AND b.status = 'approved'
                )
            ) ORDER BY c.name ASC
        ")->result();

        foreach ($cities as $c) {
            $entries[] = array('loc' => '/' . $c->slug, 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => 0.9);
        }

        // ── 3. Parent category pages (sorted A-Z) ──
        $parent_cats = $this->db->query("
            SELECT DISTINCT cat.slug, cat.name FROM categories cat
            JOIN business_categories bc ON bc.category_id = cat.id
            JOIN businesses b ON b.id = bc.business_id AND b.status = 'approved'
            WHERE cat.is_active = 1 AND cat.parent_id IS NULL
            ORDER BY cat.name ASC
        ")->result();

        foreach ($parent_cats as $cat) {
            $entries[] = array('loc' => '/services/' . $cat->slug, 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => 0.8);
        }

        // ── 4. Subcategory pages (sorted by parent name, then sub name) ──
        $sub_cats = $this->db->query("
            SELECT DISTINCT cat.slug, cat.name, p.name AS parent_name FROM categories cat
            JOIN categories p ON p.id = cat.parent_id
            JOIN business_categories bc ON bc.category_id = cat.id
            JOIN businesses b ON b.id = bc.business_id AND b.status = 'approved'
            WHERE cat.is_active = 1 AND cat.parent_id IS NOT NULL
            ORDER BY p.name ASC, cat.name ASC
        ")->result();

        foreach ($sub_cats as $cat) {
            $entries[] = array('loc' => '/services/' . $cat->slug, 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => 0.7);
        }

        // ── 5. City + Category combos grouped by city (city A-Z, then category A-Z) ──
        $combos = $this->db->query("
            SELECT DISTINCT c.slug AS city_slug, c.name AS city_name, cat.slug AS cat_slug, cat.name AS cat_name
            FROM businesses b
            JOIN cities c ON c.id = b.city_id AND c.is_active = 1
            JOIN business_categories bc ON bc.business_id = b.id
            JOIN categories cat ON cat.id = bc.category_id AND cat.is_active = 1 AND cat.parent_id IS NULL
            WHERE b.status = 'approved'
            UNION
            SELECT DISTINCT c.slug, c.name, cat.slug, cat.name
            FROM business_service_areas bsa
            JOIN businesses b ON b.id = bsa.business_id AND b.status = 'approved'
            JOIN cities c ON c.id = bsa.city_id AND c.is_active = 1 AND bsa.is_active = 1
            JOIN business_categories bc ON bc.business_id = b.id
            JOIN categories cat ON cat.id = bc.category_id AND cat.is_active = 1 AND cat.parent_id IS NULL
            ORDER BY city_name ASC, cat_name ASC
        ")->result();

        // /city/category
        foreach ($combos as $r) {
            $entries[] = array('loc' => '/' . $r->city_slug . '/' . $r->cat_slug, 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => 0.7);
        }

        // ── 6. /services/category/city combos (grouped by category A-Z, then city A-Z) ──
        $svc_combos = $this->db->query("
            SELECT DISTINCT c.slug AS city_slug, c.name AS city_name, cat.slug AS cat_slug, cat.name AS cat_name
            FROM businesses b
            JOIN cities c ON c.id = b.city_id AND c.is_active = 1
            JOIN business_categories bc ON bc.business_id = b.id
            JOIN categories cat ON cat.id = bc.category_id AND cat.is_active = 1 AND cat.parent_id IS NULL
            WHERE b.status = 'approved'
            UNION
            SELECT DISTINCT c.slug, c.name, cat.slug, cat.name
            FROM business_service_areas bsa
            JOIN businesses b ON b.id = bsa.business_id AND b.status = 'approved'
            JOIN cities c ON c.id = bsa.city_id AND c.is_active = 1 AND bsa.is_active = 1
            JOIN business_categories bc ON bc.business_id = b.id
            JOIN categories cat ON cat.id = bc.category_id AND cat.is_active = 1 AND cat.parent_id IS NULL
            ORDER BY cat_name ASC, city_name ASC
        ")->result();

        foreach ($svc_combos as $r) {
            $entries[] = array('loc' => '/services/' . $r->cat_slug . '/' . $r->city_slug, 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => 0.7);
        }

        // ── 7. Business pages (sorted A-Z by slug) ──
        $bizs = $this->db->select('slug, updated_at')
            ->from('businesses')
            ->where('status', 'approved')
            ->order_by('slug', 'ASC')
            ->get()
            ->result();

        foreach ($bizs as $biz) {
            $entries[] = array(
                'loc'        => '/business/' . $biz->slug,
                'lastmod'    => $biz->updated_at ? date('Y-m-d', strtotime($biz->updated_at)) : $today,
                'changefreq' => 'monthly',
                'priority'   => 0.6,
            );
        }

        return $entries;
    }

    /**
     * GET /api/sitemap/urls — JSON response
     */
    public function urls()
    {
        $entries = $this->_build_entries();
        $this->respond(array('urls' => $entries, 'count' => count($entries)));
    }

    /**
     * GET /api/sitemap/xml — Direct XML output
     */
    public function xml()
    {
        $base = rtrim($this->input->get('base') ?: 'http://localhost:3000', '/');
        $entries = $this->_build_entries();

        header('Content-Type: application/xml; charset=utf-8');
        header('Cache-Control: public, max-age=3600');
        header('Access-Control-Allow-Origin: *');

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($entries as $e) {
            $loc = $base . $e['loc'];
            $pri = number_format((float) $e['priority'], 1);
            echo "  <url>\n";
            echo "    <loc>" . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
            echo "    <lastmod>{$e['lastmod']}</lastmod>\n";
            echo "    <changefreq>{$e['changefreq']}</changefreq>\n";
            echo "    <priority>{$pri}</priority>\n";
            echo "  </url>\n";
        }
        echo '</urlset>';
        exit;
    }
}
