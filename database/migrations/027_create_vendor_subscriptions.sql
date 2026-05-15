-- Migration 027: Active vendor subscriptions
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    plan_id INT UNSIGNED NOT NULL,
    razorpay_subscription_id VARCHAR(100) DEFAULT NULL,
    status ENUM('active','past_due','cancelled','expired','trialing') DEFAULT 'trialing',
    billing_cycle ENUM('monthly','annual') DEFAULT 'monthly',
    current_period_start DATE DEFAULT NULL,
    current_period_end DATE DEFAULT NULL,
    trial_ends_at DATE DEFAULT NULL,
    cancelled_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_vs_vendor (vendor_id),
    INDEX idx_vs_status (status),
    INDEX idx_vs_period (current_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
