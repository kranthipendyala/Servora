-- Migration 033: Booking-linked reviews with vendor reply
CREATE TABLE IF NOT EXISTS booking_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL UNIQUE,
    customer_id INT UNSIGNED NOT NULL,
    vendor_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT DEFAULT NULL,
    vendor_reply TEXT DEFAULT NULL,
    vendor_replied_at DATETIME DEFAULT NULL,
    is_approved TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    INDEX idx_br_vendor (vendor_id, rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
