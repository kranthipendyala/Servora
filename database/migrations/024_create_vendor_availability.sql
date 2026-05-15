-- Migration 024: Vendor weekly availability schedule
CREATE TABLE IF NOT EXISTS vendor_availability (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_va_vendor_day (vendor_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
