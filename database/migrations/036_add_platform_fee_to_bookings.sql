-- Migration 036: Add platform_fee column to bookings for Phase 2 revenue
ALTER TABLE bookings
    ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 0 AFTER tax_amount;
