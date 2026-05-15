<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Category_model extends CI_Model
{
    protected $table = 'categories';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all top-level categories with optional children count.
     */
    public function get_all($include_children = FALSE)
    {
        $this->db->select('c.id, c.name, c.slug, c.icon, c.description, c.parent_id, c.sort_order');
        $this->db->from('categories c');
        $this->db->where('c.parent_id IS NULL', NULL, FALSE);
        $this->db->where('c.is_active', 1);
        $this->db->order_by('c.sort_order', 'ASC');
        $this->db->order_by('c.name', 'ASC');

        $categories = $this->db->get()->result();

        if ($include_children) {
            foreach ($categories as &$cat) {
                $cat->children = $this->_get_children($cat->id);
            }
        }

        // Attach business count for each category
        foreach ($categories as &$cat) {
            $cat->business_count = $this->_count_businesses($cat->id);
        }

        return $categories;
    }

    /**
     * Get a single category by slug, with children and business count.
     */
    public function get_by_slug($slug)
    {
        $category = $this->db->select('id, name, slug, icon, description, parent_id, sort_order, meta_title, meta_description')
            ->from($this->table)
            ->where('slug', $slug)
            ->get()
            ->row();

        if ( ! $category) {
            return NULL;
        }

        $category->children = $this->_get_children($category->id);
        $category->business_count = $this->_count_businesses($category->id);

        if ($category->parent_id) {
            $category->parent = $this->db->select('id, name, slug')
                ->from($this->table)
                ->where('id', $category->parent_id)
                ->get()
                ->row();
        } else {
            $category->parent = NULL;
        }

        return $category;
    }

    /**
     * Get category by ID.
     */
    public function get_by_id($id)
    {
        return $this->db->get_where($this->table, array('id' => $id))->row();
    }

    /**
     * Get a category with its full child tree.
     */
    public function get_with_children($id = NULL)
    {
        if ($id === NULL) {
            return $this->_build_tree();
        }

        $category = $this->get_by_id($id);
        if ( ! $category) {
            return NULL;
        }

        $category->children = $this->_get_children_recursive($category->id);
        return $category;
    }

    /**
     * Get categories available in a specific city, with business counts for that city.
     */
    public function get_by_city($city_id)
    {
        // Include businesses that serve this city via service_areas
        return $this->db->query("
            SELECT cat.id, cat.name, cat.slug, cat.icon,
                   COUNT(DISTINCT b.id) AS business_count
            FROM categories cat
            JOIN business_categories bc ON bc.category_id = cat.id
            JOIN businesses b ON b.id = bc.business_id AND b.status = 'approved'
            WHERE (b.city_id = ? OR b.id IN (
                SELECT bsa.business_id FROM business_service_areas bsa
                WHERE bsa.city_id = ? AND bsa.is_active = 1
            ))
            GROUP BY cat.id
            ORDER BY business_count DESC
        ", array($city_id, $city_id))->result();
    }

    /**
     * Get all category slugs for sitemap.
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
     * Create a new category.
     */
    public function create($data)
    {
        $insert = array(
            'name'             => $data['name'],
            'slug'             => unique_slug($data['name'], $this->table),
            'icon'             => isset($data['icon']) ? $data['icon'] : NULL,
            'description'      => isset($data['description']) ? $data['description'] : '',
            'parent_id'        => isset($data['parent_id']) ? (int) $data['parent_id'] : NULL,
            'sort_order'       => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
            'meta_title'       => isset($data['meta_title']) ? $data['meta_title'] : NULL,
            'meta_description' => isset($data['meta_description']) ? $data['meta_description'] : NULL,
            'created_at'       => date('Y-m-d H:i:s'),
        );

        $this->db->insert($this->table, $insert);
        return $this->db->insert_id();
    }

    /**
     * Update a category.
     */
    public function update($id, $data)
    {
        $allowed = array('name', 'icon', 'description', 'parent_id', 'sort_order', 'meta_title', 'meta_description');
        $update = array();

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }

        if (isset($data['name'])) {
            $update['slug'] = unique_slug($data['name'], $this->table, 'slug', $id);
        }

        $update['updated_at'] = date('Y-m-d H:i:s');

        $this->db->where('id', $id);
        return $this->db->update($this->table, $update);
    }

    /**
     * Delete a category (sets children parent_id to NULL).
     */
    public function delete($id)
    {
        // Reassign children to no parent
        $this->db->where('parent_id', $id);
        $this->db->update($this->table, array('parent_id' => NULL));

        // Remove business-category links
        $this->db->where('category_id', $id);
        $this->db->delete('business_categories');

        // Delete the category
        $this->db->where('id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Get direct children of a category.
     */
    private function _get_children($parent_id)
    {
        return $this->db->select('id, name, slug, icon, sort_order')
            ->from($this->table)
            ->where('parent_id', $parent_id)
            ->where('is_active', 1)
            ->order_by('sort_order', 'ASC')
            ->order_by('name', 'ASC')
            ->get()
            ->result();
    }

    /**
     * Recursively get all descendants.
     */
    private function _get_children_recursive($parent_id)
    {
        $children = $this->_get_children($parent_id);
        foreach ($children as &$child) {
            $child->children = $this->_get_children_recursive($child->id);
            $child->business_count = $this->_count_businesses($child->id);
        }
        return $children;
    }

    /**
     * Build full category tree from root.
     */
    private function _build_tree()
    {
        $roots = $this->db->select('id, name, slug, icon, sort_order')
            ->from($this->table)
            ->where('parent_id IS NULL', NULL, FALSE)
            ->where('is_active', 1)
            ->order_by('sort_order', 'ASC')
            ->get()
            ->result();

        foreach ($roots as &$root) {
            $root->children = $this->_get_children_recursive($root->id);
            $root->business_count = $this->_count_businesses($root->id);
        }

        return $roots;
    }

    /**
     * Count active businesses in a category (including subcategories).
     */
    private function _count_businesses($category_id)
    {
        $this->db->select('COUNT(DISTINCT bc.business_id) AS cnt');
        $this->db->from('business_categories bc');
        $this->db->join('businesses b', 'b.id = bc.business_id');
        $this->db->where('bc.category_id', $category_id);
        $this->db->where('b.status', 'approved');

        return (int) $this->db->get()->row()->cnt;
    }
}
