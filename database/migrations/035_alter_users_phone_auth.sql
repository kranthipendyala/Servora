-- Migration 035: Make email/password optional for phone OTP auth, add google_id
ALTER TABLE users
    MODIFY COLUMN email VARCHAR(255) DEFAULT NULL,
    MODIFY COLUMN password VARCHAR(255) DEFAULT NULL,
    ADD COLUMN google_id VARCHAR(100) DEFAULT NULL AFTER otp_expires_at,
    ADD COLUMN onboarding_completed TINYINT(1) DEFAULT 0 AFTER google_id;

-- Add phone index for phone-based lookups
ALTER TABLE users ADD INDEX idx_user_phone (phone);

-- Add google_id index (ignore if already exists)
ALTER TABLE users ADD INDEX idx_user_google (google_id);

-- Remove unique constraint on email (allow NULL duplicates for phone-only users)
-- Note: MySQL allows multiple NULLs in unique index, so this should work as-is
