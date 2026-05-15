-- Migration 031: Chat conversations (one per booking)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    vendor_id INT UNSIGNED NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    UNIQUE INDEX idx_chat_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
