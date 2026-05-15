-- Migration 020: Payment records (Razorpay integration)
CREATE TABLE IF NOT EXISTS payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    razorpay_payment_id VARCHAR(100) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'INR',
    status ENUM('created','authorized','captured','refunded','failed') DEFAULT 'created',
    method VARCHAR(50) DEFAULT NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_id VARCHAR(100) DEFAULT NULL,
    gateway_response JSON DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_pay_booking (booking_id),
    INDEX idx_pay_razorpay (razorpay_order_id),
    INDEX idx_pay_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
