-- Migration 028: Vendor payouts
CREATE TABLE IF NOT EXISTS payouts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
    payout_method VARCHAR(50) DEFAULT 'bank_transfer',
    bank_details JSON DEFAULT NULL,
    reference_id VARCHAR(100) DEFAULT NULL,
    period_start DATE DEFAULT NULL,
    period_end DATE DEFAULT NULL,
    bookings_count INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    notes TEXT DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    INDEX idx_payout_vendor (vendor_id),
    INDEX idx_payout_status (status),
    INDEX idx_payout_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
