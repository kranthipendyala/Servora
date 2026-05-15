-- Migration 030: Vendor KYC documents
CREATE TABLE IF NOT EXISTS vendor_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    document_type ENUM('aadhaar','pan','gst','trade_license','other') NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    rejection_reason VARCHAR(255) DEFAULT NULL,
    reviewed_by INT UNSIGNED DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vd_vendor (vendor_id),
    INDEX idx_vd_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
