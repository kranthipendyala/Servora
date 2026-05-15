-- Migration 016: Services offered by vendors/businesses
CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL,
    description TEXT DEFAULT NULL,
    short_description VARCHAR(500) DEFAULT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) DEFAULT NULL,
    price_unit ENUM('fixed','per_hour','per_sqft','per_unit') DEFAULT 'fixed',
    duration_minutes INT UNSIGNED DEFAULT 60,
    image VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_svc_business (business_id, is_active),
    INDEX idx_svc_category (category_id),
    INDEX idx_svc_price (base_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
