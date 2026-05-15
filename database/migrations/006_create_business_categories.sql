-- Migration 006: Business-Category pivot table
CREATE TABLE IF NOT EXISTS business_categories (
    business_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    PRIMARY KEY (business_id, category_id),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_bc_category (category_id),
    INDEX idx_bc_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
