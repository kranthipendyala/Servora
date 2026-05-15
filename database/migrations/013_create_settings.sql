-- Migration 013: Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Servora'),
('site_tagline', 'Find Trusted Home Services Near You'),
('site_url', 'http://localhost:3000'),
('api_url', 'http://localhost/Servora/api'),
('contact_email', 'info@servora.com'),
('contact_phone', ''),
('default_city', 'mumbai'),
('listings_per_page', '20'),
('reviews_per_page', '10');
