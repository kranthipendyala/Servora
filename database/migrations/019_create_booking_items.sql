-- Migration 019: Booking line items (services included in a booking)
CREATE TABLE IF NOT EXISTS booking_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    variant_id INT UNSIGNED DEFAULT NULL,
    service_name VARCHAR(255) DEFAULT NULL,
    variant_name VARCHAR(150) DEFAULT NULL,
    quantity INT UNSIGNED DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (variant_id) REFERENCES service_variants(id) ON DELETE SET NULL,
    INDEX idx_bi_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
