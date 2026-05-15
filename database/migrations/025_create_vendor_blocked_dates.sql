-- Migration 025: Vendor blocked/unavailable dates
CREATE TABLE IF NOT EXISTS vendor_blocked_dates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_vbd_vendor_date (vendor_id, blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
