-- Run all migrations for Mechanical Directory
-- Execute: mysql -u root < run_migrations.sql

CREATE DATABASE IF NOT EXISTS mechanical_directory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mechanical_directory;

SOURCE migrations/001_create_states.sql;
SOURCE migrations/002_create_cities.sql;
SOURCE migrations/003_create_localities.sql;
SOURCE migrations/004_create_categories.sql;
SOURCE migrations/005_create_businesses.sql;
SOURCE migrations/006_create_business_categories.sql;
SOURCE migrations/007_create_business_images.sql;
SOURCE migrations/008_create_users.sql;
SOURCE migrations/009_create_reviews.sql;
SOURCE migrations/010_create_business_claims.sql;
SOURCE migrations/011_create_seo_meta.sql;
SOURCE migrations/012_create_pages.sql;
SOURCE migrations/013_create_settings.sql;

-- Seed data
SOURCE seeds/seed_states_cities.sql;
SOURCE seeds/seed_categories.sql;

SELECT 'All migrations and seeds completed successfully!' AS status;
