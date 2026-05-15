-- Business can serve multiple cities
CREATE TABLE IF NOT EXISTS business_service_areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id INT UNSIGNED NOT NULL,
    city_id INT UNSIGNED NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_business_city (business_id, city_id),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id),
    INDEX idx_business (business_id)
);

-- Seed: copy each business's home city as their first service area
INSERT IGNORE INTO business_service_areas (business_id, city_id)
SELECT id, city_id FROM businesses WHERE city_id IS NOT NULL;
