-- Migration 022: OTP verifications for phone-based auth
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose ENUM('login','register','verify_phone','reset_password') DEFAULT 'login',
    is_used TINYINT(1) DEFAULT 0,
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_phone (phone, purpose),
    INDEX idx_otp_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
