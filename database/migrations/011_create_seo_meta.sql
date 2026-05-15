-- Migration 011: SEO Meta (custom overrides per page)
CREATE TABLE IF NOT EXISTS seo_meta (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_type ENUM('home','city','category','city_category','city_category_locality','business','page') NOT NULL,
    reference_slug VARCHAR(500) NOT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    og_title VARCHAR(255) DEFAULT NULL,
    og_description TEXT DEFAULT NULL,
    og_image VARCHAR(500) DEFAULT NULL,
    canonical_url VARCHAR(500) DEFAULT NULL,
    h1_override VARCHAR(255) DEFAULT NULL,
    additional_schema JSON DEFAULT NULL,
    no_index TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_seo_type_slug (page_type, reference_slug(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
