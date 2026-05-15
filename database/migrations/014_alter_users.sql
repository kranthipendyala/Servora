-- Migration 014: Alter users table for marketplace features
ALTER TABLE users
    ADD COLUMN phone_verified TINYINT(1) DEFAULT 0 AFTER phone,
    ADD COLUMN fcm_token VARCHAR(500) DEFAULT NULL AFTER avatar,
    ADD COLUMN otp_code VARCHAR(10) DEFAULT NULL AFTER fcm_token,
    ADD COLUMN otp_expires_at DATETIME DEFAULT NULL AFTER otp_code,
    MODIFY COLUMN role ENUM('user','vendor','business_owner','admin','super_admin') DEFAULT 'user';
