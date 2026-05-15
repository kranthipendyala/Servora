-- Migration 037: Leads table for JustDial-style contact tracking
CREATE TABLE IF NOT EXISTS leads (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT UNSIGNED DEFAULT NULL,
    vendor_id INT UNSIGNED NOT NULL,
    business_id INT UNSIGNED NOT NULL,
    contact_method ENUM('call','whatsapp','enquiry') NOT NULL,
    customer_name VARCHAR(150) DEFAULT NULL,
    customer_phone VARCHAR(20) DEFAULT NULL,
    customer_email VARCHAR(255) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    status ENUM('new','contacted','converted','closed') DEFAULT 'new',
    lead_fee DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    INDEX idx_lead_vendor (vendor_id),
    INDEX idx_lead_business (business_id),
    INDEX idx_lead_status (status),
    INDEX idx_lead_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
