-- Migration 021: Commission rules per category
CREATE TABLE IF NOT EXISTS commission_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED DEFAULT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    min_commission DECIMAL(10,2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_comm_cat (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default commission rule (applies when no category-specific rule exists)
INSERT INTO commission_rules (category_id, commission_percentage, min_commission) VALUES
(NULL, 15.00, 50.00);
