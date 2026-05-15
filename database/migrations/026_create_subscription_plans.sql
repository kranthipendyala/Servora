-- Migration 026: Subscription plans for vendors
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) DEFAULT NULL,
    features JSON DEFAULT NULL,
    max_services INT DEFAULT 5,
    max_bookings_per_month INT DEFAULT 50,
    commission_discount DECIMAL(5,2) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    priority_in_search INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default plans
INSERT INTO subscription_plans (name, slug, description, monthly_price, annual_price, features, max_services, max_bookings_per_month, commission_discount, is_featured, priority_in_search, sort_order) VALUES
('Basic', 'basic', 'Get started with essential features', 499.00, 4999.00, '["Up to 5 services", "50 bookings/month", "Basic profile", "Email support"]', 5, 50, 0, 0, 0, 1),
('Pro', 'pro', 'Grow your business with advanced tools', 999.00, 9999.00, '["Up to 20 services", "200 bookings/month", "Featured badge", "Priority listing", "2% commission discount", "Phone support"]', 20, 200, 2.00, 1, 5, 2),
('Premium', 'premium', 'Unlimited access for top professionals', 1999.00, 19999.00, '["Unlimited services", "Unlimited bookings", "Premium badge", "Top listing", "5% commission discount", "Dedicated support", "Analytics dashboard"]', 999, 9999, 5.00, 1, 10, 3);
