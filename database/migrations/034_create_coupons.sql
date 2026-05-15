-- Migration 034: Coupon/promo codes
CREATE TABLE IF NOT EXISTS coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    discount_type ENUM('percentage','fixed') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount DECIMAL(10,2) DEFAULT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    category_id INT UNSIGNED DEFAULT NULL,
    valid_from DATETIME DEFAULT NULL,
    valid_until DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_coupon_code (code),
    INDEX idx_coupon_dates (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, max_discount, min_order_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME50', 'Get 50% off on your first booking', 'percentage', 50.00, 200.00, 299.00, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('FLAT100', 'Flat Rs.100 off on orders above Rs.500', 'fixed', 100.00, NULL, 500.00, 500, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)),
('CLEAN20', '20% off on cleaning services', 'percentage', 20.00, 300.00, 499.00, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
