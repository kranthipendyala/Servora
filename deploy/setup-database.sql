-- ==============================================
-- Servora - Complete Database Setup
-- Import this file in phpMyAdmin
-- ==============================================

CREATE DATABASE IF NOT EXISTS servora_directory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE servora_directory;

-- ==============================================
-- MIGRATIONS
-- ==============================================

-- --- migrations/001_create_states.sql ---
-- Migration 001: States
CREATE TABLE IF NOT EXISTS states (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_state_slug (slug),
    INDEX idx_state_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/002_create_cities.sql ---
-- Migration 002: Cities
CREATE TABLE IF NOT EXISTS cities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    state_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    INDEX idx_city_slug (slug),
    INDEX idx_city_state (state_id),
    INDEX idx_city_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/003_create_localities.sql ---
-- Migration 003: Localities
CREATE TABLE IF NOT EXISTS localities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    pin_code VARCHAR(10) DEFAULT NULL,
    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_locality_city_slug (city_id, slug),
    INDEX idx_locality_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/004_create_categories.sql ---
-- Migration 004: Categories (hierarchical for mechanical services)
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    icon VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_cat_slug (slug),
    INDEX idx_cat_parent (parent_id),
    INDEX idx_cat_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/005_create_businesses.sql ---
-- Migration 005: Businesses (core table)
CREATE TABLE IF NOT EXISTS businesses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    address TEXT,
    city_id INT UNSIGNED NOT NULL,
    locality_id INT UNSIGNED DEFAULT NULL,
    state_id INT UNSIGNED NOT NULL,
    pin_code VARCHAR(10),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,
    logo VARCHAR(500) DEFAULT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    year_established YEAR DEFAULT NULL,
    owner_user_id INT UNSIGNED DEFAULT NULL,
    avg_rating DECIMAL(2,1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    status ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
    business_hours JSON DEFAULT NULL,
    social_links JSON DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE SET NULL,
    FOREIGN KEY (state_id) REFERENCES states(id),
    INDEX idx_biz_slug (slug),
    INDEX idx_biz_city (city_id),
    INDEX idx_biz_locality (locality_id),
    INDEX idx_biz_state (state_id),
    INDEX idx_biz_status (status, is_active),
    INDEX idx_biz_featured (is_featured, is_active),
    INDEX idx_biz_rating (avg_rating DESC),
    FULLTEXT INDEX idx_biz_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/006_create_business_categories.sql ---
-- Migration 006: Business-Category pivot table
CREATE TABLE IF NOT EXISTS business_categories (
    business_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    PRIMARY KEY (business_id, category_id),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_bc_category (category_id),
    INDEX idx_bc_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/007_create_business_images.sql ---
-- Migration 007: Business Images
CREATE TABLE IF NOT EXISTS business_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_bimg_business (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/008_create_users.sql ---
-- Migration 008: Users
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    role ENUM('user','business_owner','admin','super_admin') DEFAULT 'user',
    api_token VARCHAR(64) DEFAULT NULL,
    token_expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    email_verified_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_user_email (email),
    UNIQUE INDEX idx_user_token (api_token),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/009_create_reviews.sql ---
-- Migration 009: Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    comment TEXT,
    is_approved TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_biz (business_id, is_approved),
    INDEX idx_review_user (user_id),
    INDEX idx_review_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/010_create_business_claims.sql ---
-- Migration 010: Business Claims
CREATE TABLE IF NOT EXISTS business_claims (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    proof_document VARCHAR(500) DEFAULT NULL,
    notes TEXT,
    reviewed_by INT UNSIGNED DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_claim_status (status),
    INDEX idx_claim_business (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/011_create_seo_meta.sql ---
-- Migration 011: SEO Meta (custom overrides per page)
CREATE TABLE IF NOT EXISTS seo_meta (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_type ENUM('home','city','category','city_category','city_category_locality','business','page') NOT NULL,
    reference_slug VARCHAR(500) NOT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    og_title VARCHAR(255) DEFAULT NULL,
    og_description TEXT DEFAULT NULL,
    og_image VARCHAR(500) DEFAULT NULL,
    canonical_url VARCHAR(500) DEFAULT NULL,
    h1_override VARCHAR(255) DEFAULT NULL,
    additional_schema JSON DEFAULT NULL,
    no_index TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_seo_type_slug (page_type, reference_slug(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/012_create_pages.sql ---
-- Migration 012: CMS Pages
CREATE TABLE IF NOT EXISTS pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    is_published TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_page_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- migrations/013_create_settings.sql ---
-- Migration 013: Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Servora'),
('site_tagline', 'Find Trusted Home Services Near You'),
('site_url', 'http://localhost:3000'),
('api_url', 'http://localhost/Servora/api'),
('contact_email', 'info@servora.com'),
('contact_phone', ''),
('default_city', 'mumbai'),
('listings_per_page', '20'),
('reviews_per_page', '10');


-- ==============================================
-- SEED DATA
-- ==============================================

-- --- Seeds: States & Cities ---
-- Seed: Indian States & Major Cities

-- States
INSERT INTO states (name, slug) VALUES
('Maharashtra', 'maharashtra'),
('Delhi', 'delhi'),
('Karnataka', 'karnataka'),
('Tamil Nadu', 'tamil-nadu'),
('Telangana', 'telangana'),
('Gujarat', 'gujarat'),
('Rajasthan', 'rajasthan'),
('Uttar Pradesh', 'uttar-pradesh'),
('West Bengal', 'west-bengal'),
('Madhya Pradesh', 'madhya-pradesh'),
('Kerala', 'kerala'),
('Punjab', 'punjab'),
('Haryana', 'haryana'),
('Bihar', 'bihar'),
('Odisha', 'odisha'),
('Andhra Pradesh', 'andhra-pradesh'),
('Jharkhand', 'jharkhand'),
('Assam', 'assam'),
('Chhattisgarh', 'chhattisgarh'),
('Goa', 'goa');

-- Major Cities
INSERT INTO cities (state_id, name, slug, latitude, longitude) VALUES
-- Maharashtra
((SELECT id FROM states WHERE slug='maharashtra'), 'Mumbai', 'mumbai', 19.0760, 72.8777),
((SELECT id FROM states WHERE slug='maharashtra'), 'Pune', 'pune', 18.5204, 73.8567),
((SELECT id FROM states WHERE slug='maharashtra'), 'Nagpur', 'nagpur', 21.1458, 79.0882),
((SELECT id FROM states WHERE slug='maharashtra'), 'Thane', 'thane', 19.2183, 72.9781),
((SELECT id FROM states WHERE slug='maharashtra'), 'Nashik', 'nashik', 19.9975, 73.7898),
-- Delhi
((SELECT id FROM states WHERE slug='delhi'), 'New Delhi', 'new-delhi', 28.6139, 77.2090),
-- Karnataka
((SELECT id FROM states WHERE slug='karnataka'), 'Bangalore', 'bangalore', 12.9716, 77.5946),
((SELECT id FROM states WHERE slug='karnataka'), 'Mysore', 'mysore', 12.2958, 76.6394),
-- Tamil Nadu
((SELECT id FROM states WHERE slug='tamil-nadu'), 'Chennai', 'chennai', 13.0827, 80.2707),
((SELECT id FROM states WHERE slug='tamil-nadu'), 'Coimbatore', 'coimbatore', 11.0168, 76.9558),
((SELECT id FROM states WHERE slug='tamil-nadu'), 'Madurai', 'madurai', 9.9252, 78.1198),
-- Telangana
((SELECT id FROM states WHERE slug='telangana'), 'Hyderabad', 'hyderabad', 17.3850, 78.4867),
-- Gujarat
((SELECT id FROM states WHERE slug='gujarat'), 'Ahmedabad', 'ahmedabad', 23.0225, 72.5714),
((SELECT id FROM states WHERE slug='gujarat'), 'Surat', 'surat', 21.1702, 72.8311),
((SELECT id FROM states WHERE slug='gujarat'), 'Vadodara', 'vadodara', 22.3072, 73.1812),
-- Rajasthan
((SELECT id FROM states WHERE slug='rajasthan'), 'Jaipur', 'jaipur', 26.9124, 75.7873),
((SELECT id FROM states WHERE slug='rajasthan'), 'Jodhpur', 'jodhpur', 26.2389, 73.0243),
((SELECT id FROM states WHERE slug='rajasthan'), 'Udaipur', 'udaipur', 24.5854, 73.7125),
-- Uttar Pradesh
((SELECT id FROM states WHERE slug='uttar-pradesh'), 'Lucknow', 'lucknow', 26.8467, 80.9462),
((SELECT id FROM states WHERE slug='uttar-pradesh'), 'Noida', 'noida', 28.5355, 77.3910),
((SELECT id FROM states WHERE slug='uttar-pradesh'), 'Kanpur', 'kanpur', 26.4499, 80.3319),
((SELECT id FROM states WHERE slug='uttar-pradesh'), 'Varanasi', 'varanasi', 25.3176, 82.9739),
-- West Bengal
((SELECT id FROM states WHERE slug='west-bengal'), 'Kolkata', 'kolkata', 22.5726, 88.3639),
-- Madhya Pradesh
((SELECT id FROM states WHERE slug='madhya-pradesh'), 'Indore', 'indore', 22.7196, 75.8577),
((SELECT id FROM states WHERE slug='madhya-pradesh'), 'Bhopal', 'bhopal', 23.2599, 77.4126),
-- Kerala
((SELECT id FROM states WHERE slug='kerala'), 'Kochi', 'kochi', 9.9312, 76.2673),
((SELECT id FROM states WHERE slug='kerala'), 'Thiruvananthapuram', 'thiruvananthapuram', 8.5241, 76.9366),
-- Punjab
((SELECT id FROM states WHERE slug='punjab'), 'Chandigarh', 'chandigarh', 30.7333, 76.7794),
((SELECT id FROM states WHERE slug='punjab'), 'Ludhiana', 'ludhiana', 30.9010, 75.8573),
-- Haryana
((SELECT id FROM states WHERE slug='haryana'), 'Gurgaon', 'gurgaon', 28.4595, 77.0266),
((SELECT id FROM states WHERE slug='haryana'), 'Faridabad', 'faridabad', 28.4089, 77.3178),
-- Bihar
((SELECT id FROM states WHERE slug='bihar'), 'Patna', 'patna', 25.6093, 85.1376),
-- Odisha
((SELECT id FROM states WHERE slug='odisha'), 'Bhubaneswar', 'bhubaneswar', 20.2961, 85.8245),
-- Andhra Pradesh
((SELECT id FROM states WHERE slug='andhra-pradesh'), 'Visakhapatnam', 'visakhapatnam', 17.6868, 83.2185),
((SELECT id FROM states WHERE slug='andhra-pradesh'), 'Vijayawada', 'vijayawada', 16.5062, 80.6480),
-- Goa
((SELECT id FROM states WHERE slug='goa'), 'Panaji', 'panaji', 15.4909, 73.8278);

-- Sample Localities for Mumbai
INSERT INTO localities (city_id, name, slug, pin_code) VALUES
((SELECT id FROM cities WHERE slug='mumbai'), 'Andheri', 'andheri', '400058'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Bandra', 'bandra', '400050'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Borivali', 'borivali', '400066'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Dadar', 'dadar', '400014'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Goregaon', 'goregaon', '400062'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Malad', 'malad', '400064'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Powai', 'powai', '400076'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Thane West', 'thane-west', '400601'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Worli', 'worli', '400018'),
((SELECT id FROM cities WHERE slug='mumbai'), 'Lower Parel', 'lower-parel', '400013');

-- Sample Localities for Bangalore
INSERT INTO localities (city_id, name, slug, pin_code) VALUES
((SELECT id FROM cities WHERE slug='bangalore'), 'Koramangala', 'koramangala', '560034'),
((SELECT id FROM cities WHERE slug='bangalore'), 'Whitefield', 'whitefield', '560066'),
((SELECT id FROM cities WHERE slug='bangalore'), 'Indiranagar', 'indiranagar', '560038'),
((SELECT id FROM cities WHERE slug='bangalore'), 'HSR Layout', 'hsr-layout', '560102'),
((SELECT id FROM cities WHERE slug='bangalore'), 'Electronic City', 'electronic-city', '560100'),
((SELECT id FROM cities WHERE slug='bangalore'), 'Jayanagar', 'jayanagar', '560041'),
((SELECT id FROM cities WHERE slug='bangalore'), 'Marathahalli', 'marathahalli', '560037'),
((SELECT id FROM cities WHERE slug='bangalore'), 'BTM Layout', 'btm-layout', '560076');

-- Sample Localities for Delhi
INSERT INTO localities (city_id, name, slug, pin_code) VALUES
((SELECT id FROM cities WHERE slug='new-delhi'), 'Dwarka', 'dwarka', '110075'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Rohini', 'rohini', '110085'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Karol Bagh', 'karol-bagh', '110005'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Lajpat Nagar', 'lajpat-nagar', '110024'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Saket', 'saket', '110017'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Connaught Place', 'connaught-place', '110001'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Janakpuri', 'janakpuri', '110058'),
((SELECT id FROM cities WHERE slug='new-delhi'), 'Pitampura', 'pitampura', '110034');

-- --- Seeds: Categories (parents only from file) ---
-- Seed: Mechanical Service Categories

-- Parent Categories (Main Trades)
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
('Plumbing Services', 'plumbing-services', 'wrench', 'Professional plumbing repair, installation and maintenance services', 1),
('Electrical Services', 'electrical-services', 'zap', 'Certified electricians for residential and commercial electrical work', 2),
('HVAC Services', 'hvac-services', 'thermometer', 'Heating, ventilation and air conditioning installation and repair', 3),
('Auto Mechanic', 'auto-mechanic', 'car', 'Automobile repair, maintenance and servicing', 4),
('Welding Services', 'welding-services', 'flame', 'Professional welding, fabrication and metalwork services', 5),
('Carpentry Services', 'carpentry-services', 'hammer', 'Skilled carpenters for furniture, doors, windows and woodwork', 6),
('Painting Services', 'painting-services', 'paintbrush', 'Interior and exterior painting, wall textures and coatings', 7),
('Appliance Repair', 'appliance-repair', 'settings', 'Home and commercial appliance repair and servicing', 8),
('Elevator & Lift Services', 'elevator-lift-services', 'arrow-up', 'Elevator installation, maintenance and repair', 9),
('Generator Services', 'generator-services', 'battery', 'Generator installation, repair and maintenance', 10),
('Pump Services', 'pump-services', 'droplet', 'Water pump, submersible pump installation and repair', 11),
('Industrial Machinery', 'industrial-machinery', 'cog', 'Industrial machine installation, repair and maintenance', 12),
('CNC & Machining', 'cnc-machining', 'cpu', 'CNC machining, lathe work and precision engineering', 13),
('Fabrication Services', 'fabrication-services', 'layers', 'Metal fabrication, steel structures and custom metalwork', 14),
('Solar Panel Services', 'solar-panel-services', 'sun', 'Solar panel installation, maintenance and repair', 15),
('Fire Safety Services', 'fire-safety-services', 'shield', 'Fire extinguisher, fire alarm and suppression system services', 16),
('Pest Control', 'pest-control', 'bug', 'Residential and commercial pest control services', 17),
('Waterproofing', 'waterproofing', 'umbrella', 'Waterproofing solutions for roofs, walls and basements', 18),
('RO & Water Purifier', 'ro-water-purifier', 'filter', 'RO system installation, repair and AMC services', 19),
('CCTV & Security', 'cctv-security', 'camera', 'CCTV installation, security systems and access control', 20);

-- Sub-categories: Plumbing
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Pipe Fitting', 'pipe-fitting', 'wrench', 'Pipe installation, repair and replacement', 1),
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Bathroom Plumbing', 'bathroom-plumbing', 'wrench', 'Toilet, shower, basin and bathroom fixture work', 2),
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Drainage & Sewage', 'drainage-sewage', 'wrench', 'Drain cleaning, sewage line repair and maintenance', 3),
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Water Tank Services', 'water-tank-services', 'wrench', 'Water tank installation, cleaning and repair', 4),
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Gas Pipeline', 'gas-pipeline', 'wrench', 'Gas pipeline installation and leak repair', 5);

-- Sub-categories: Electrical
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='electrical-services'), 'House Wiring', 'house-wiring', 'zap', 'Complete home electrical wiring and rewiring', 1),
((SELECT id FROM categories WHERE slug='electrical-services'), 'Switchboard & Panel', 'switchboard-panel', 'zap', 'Switchboard installation and distribution panel work', 2),
((SELECT id FROM categories WHERE slug='electrical-services'), 'Inverter & UPS', 'inverter-ups', 'zap', 'Inverter and UPS installation and repair', 3),
((SELECT id FROM categories WHERE slug='electrical-services'), 'Industrial Electrical', 'industrial-electrical', 'zap', 'Factory and industrial electrical installations', 4),
((SELECT id FROM categories WHERE slug='electrical-services'), 'LED & Lighting', 'led-lighting', 'zap', 'LED installation, decorative and commercial lighting', 5);

-- Sub-categories: HVAC
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='hvac-services'), 'AC Installation', 'ac-installation', 'thermometer', 'Split AC, window AC and central AC installation', 1),
((SELECT id FROM categories WHERE slug='hvac-services'), 'AC Repair', 'ac-repair', 'thermometer', 'AC servicing, gas refill and repair', 2),
((SELECT id FROM categories WHERE slug='hvac-services'), 'Refrigeration', 'refrigeration', 'thermometer', 'Commercial refrigeration and cold storage systems', 3),
((SELECT id FROM categories WHERE slug='hvac-services'), 'Duct Work', 'duct-work', 'thermometer', 'HVAC duct installation and cleaning', 4);

-- Sub-categories: Auto Mechanic
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='auto-mechanic'), 'Car Service', 'car-service', 'car', 'General car servicing and maintenance', 1),
((SELECT id FROM categories WHERE slug='auto-mechanic'), 'Two Wheeler Repair', 'two-wheeler-repair', 'car', 'Bike and scooter repair and servicing', 2),
((SELECT id FROM categories WHERE slug='auto-mechanic'), 'Denting & Painting', 'denting-painting', 'car', 'Vehicle body repair, denting and painting', 3),
((SELECT id FROM categories WHERE slug='auto-mechanic'), 'Tyre & Wheel', 'tyre-wheel', 'car', 'Tyre replacement, wheel alignment and balancing', 4),
((SELECT id FROM categories WHERE slug='auto-mechanic'), 'Engine Repair', 'engine-repair', 'car', 'Engine overhaul, tuning and repair', 5);

-- Sub-categories: Appliance Repair
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='appliance-repair'), 'Washing Machine Repair', 'washing-machine-repair', 'settings', 'All brands washing machine repair and service', 1),
((SELECT id FROM categories WHERE slug='appliance-repair'), 'Refrigerator Repair', 'refrigerator-repair', 'settings', 'Fridge repair, gas charging and compressor work', 2),
((SELECT id FROM categories WHERE slug='appliance-repair'), 'Microwave & Oven Repair', 'microwave-oven-repair', 'settings', 'Microwave, OTG and oven repair services', 3),
((SELECT id FROM categories WHERE slug='appliance-repair'), 'Geyser Repair', 'geyser-repair', 'settings', 'Water heater and geyser installation and repair', 4),
((SELECT id FROM categories WHERE slug='appliance-repair'), 'Chimney & Hob Repair', 'chimney-hob-repair', 'settings', 'Kitchen chimney and gas hob servicing', 5);

-- --- Seeds: Businesses ---
-- Seed: Sample Businesses

SET @mumbai = (SELECT id FROM cities WHERE slug='mumbai');
SET @bangalore = (SELECT id FROM cities WHERE slug='bangalore');
SET @delhi = (SELECT id FROM cities WHERE slug='new-delhi');
SET @chennai = (SELECT id FROM cities WHERE slug='chennai');
SET @hyderabad = (SELECT id FROM cities WHERE slug='hyderabad');
SET @pune = (SELECT id FROM cities WHERE slug='pune');
SET @ahmedabad = (SELECT id FROM cities WHERE slug='ahmedabad');
SET @jaipur = (SELECT id FROM cities WHERE slug='jaipur');

SET @mh = (SELECT id FROM states WHERE slug='maharashtra');
SET @ka = (SELECT id FROM states WHERE slug='karnataka');
SET @dl = (SELECT id FROM states WHERE slug='delhi');
SET @tn = (SELECT id FROM states WHERE slug='tamil-nadu');
SET @tg = (SELECT id FROM states WHERE slug='telangana');
SET @gj = (SELECT id FROM states WHERE slug='gujarat');
SET @rj = (SELECT id FROM states WHERE slug='rajasthan');

SET @andheri = (SELECT id FROM localities WHERE slug='andheri' AND city_id=@mumbai);
SET @bandra = (SELECT id FROM localities WHERE slug='bandra' AND city_id=@mumbai);
SET @goregaon = (SELECT id FROM localities WHERE slug='goregaon' AND city_id=@mumbai);
SET @powai = (SELECT id FROM localities WHERE slug='powai' AND city_id=@mumbai);
SET @dadar = (SELECT id FROM localities WHERE slug='dadar' AND city_id=@mumbai);
SET @malad = (SELECT id FROM localities WHERE slug='malad' AND city_id=@mumbai);
SET @worli = (SELECT id FROM localities WHERE slug='worli' AND city_id=@mumbai);

SET @koramangala = (SELECT id FROM localities WHERE slug='koramangala' AND city_id=@bangalore);
SET @whitefield = (SELECT id FROM localities WHERE slug='whitefield' AND city_id=@bangalore);
SET @indiranagar = (SELECT id FROM localities WHERE slug='indiranagar' AND city_id=@bangalore);
SET @hsrlayout = (SELECT id FROM localities WHERE slug='hsr-layout' AND city_id=@bangalore);

SET @dwarka = (SELECT id FROM localities WHERE slug='dwarka' AND city_id=@delhi);
SET @rohini = (SELECT id FROM localities WHERE slug='rohini' AND city_id=@delhi);
SET @saket = (SELECT id FROM localities WHERE slug='saket' AND city_id=@delhi);

INSERT INTO businesses (name, slug, description, short_description, address, city_id, locality_id, state_id, pin_code, phone, mobile, email, website, latitude, longitude, year_established, owner_user_id, avg_rating, total_reviews, is_verified, is_featured, is_active, status, business_hours) VALUES

-- Mumbai
('Sharma Plumbing Solutions', 'sharma-plumbing-solutions', 'Expert plumbing services for residential and commercial properties in Mumbai. We specialize in pipe fitting, bathroom plumbing, drainage systems, and emergency plumbing repairs. 24/7 service available with fully trained and certified plumbers.', 'Expert plumbing services for residential & commercial properties. 24/7 emergency repairs.', '45, Andheri East, SVP Nagar', @mumbai, @andheri, @mh, '400058', '022-28001234', '9876543210', 'info@sharmaplumbing.com', 'https://sharmaplumbing.com', 19.1136, 72.8697, 2005, 2, 4.5, 28, 1, 1, 1, 'approved', '{"mon":"8:00-20:00","tue":"8:00-20:00","wed":"8:00-20:00","thu":"8:00-20:00","fri":"8:00-20:00","sat":"9:00-18:00","sun":"10:00-14:00"}'),

('Quick Fix Plumbers', 'quick-fix-plumbers', 'Quick Fix Plumbers provides fast and reliable plumbing services across Mumbai. From leaky taps to complete bathroom renovations, our team handles it all. Licensed and insured professionals.', 'Fast and reliable plumbing services across Mumbai. Licensed professionals.', '12, Hill Road, Bandra West', @mumbai, @bandra, @mh, '400050', '022-26001234', '9876543211', 'contact@quickfixplumbers.com', NULL, 19.0544, 72.8367, 2012, NULL, 4.2, 15, 1, 0, 1, 'approved', '{"mon":"9:00-19:00","tue":"9:00-19:00","wed":"9:00-19:00","thu":"9:00-19:00","fri":"9:00-19:00","sat":"9:00-17:00","sun":"closed"}'),

('Bright Spark Electricals', 'bright-spark-electricals', 'Professional electrical services including house wiring, panel installation, inverter setup, and industrial electrical work. Government licensed electricians with 15+ years experience serving Mumbai.', 'Government licensed electricians. House wiring, panels & industrial electrical.', '78, SV Road, Goregaon West', @mumbai, @goregaon, @mh, '400062', '022-28501234', '9876543212', 'bright@sparkelectricals.com', 'https://brightsparkelectricals.com', 19.1663, 72.8494, 2008, 2, 4.7, 42, 1, 1, 1, 'approved', '{"mon":"8:00-20:00","tue":"8:00-20:00","wed":"8:00-20:00","thu":"8:00-20:00","fri":"8:00-20:00","sat":"9:00-18:00","sun":"10:00-16:00"}'),

('Cool Breeze AC Services', 'cool-breeze-ac-services', 'Complete AC solutions for Mumbai homes and offices. AC installation, repair, servicing, gas refilling, and AMC plans for all brands including Samsung, LG, Daikin, Voltas, and Blue Star.', 'Complete AC solutions - installation, repair & AMC for all brands.', '156, Powai Plaza, Hiranandani', @mumbai, @powai, @mh, '400076', '022-25001234', '9876543213', 'service@coolbreezeac.com', NULL, 19.1176, 72.9060, 2010, NULL, 4.3, 31, 1, 1, 1, 'approved', '{"mon":"9:00-21:00","tue":"9:00-21:00","wed":"9:00-21:00","thu":"9:00-21:00","fri":"9:00-21:00","sat":"9:00-21:00","sun":"10:00-18:00"}'),

('AutoCare Garage Mumbai', 'autocare-garage-mumbai', 'Full-service automobile garage in Dadar, Mumbai. Car servicing, engine repair, denting & painting, wheel alignment, and electrical diagnostics. Authorized for Maruti, Hyundai, and Tata vehicles.', 'Full-service auto garage. Car servicing, engine repair, denting & painting.', '34, Dadar TT, Prabhadevi', @mumbai, @dadar, @mh, '400014', '022-24001234', '9876543214', 'info@autocaremumbai.com', 'https://autocaremumbai.com', 19.0178, 72.8439, 2003, 2, 4.6, 56, 1, 1, 1, 'approved', '{"mon":"7:00-20:00","tue":"7:00-20:00","wed":"7:00-20:00","thu":"7:00-20:00","fri":"7:00-20:00","sat":"7:00-18:00","sun":"8:00-14:00"}'),

('Malad RO Water Solutions', 'malad-ro-water-solutions', 'RO water purifier installation and repair in Malad, Mumbai. Servicing all brands - Kent, Aquaguard, Pureit, Livpure. AMC packages starting Rs 1500/year. Same day service guaranteed.', 'RO water purifier installation & repair for all brands. Same day service.', '23, Malad West, Link Road', @mumbai, @malad, @mh, '400064', '022-28701234', '9876543225', 'service@maladro.com', NULL, 19.1874, 72.8484, 2017, NULL, 4.1, 14, 1, 0, 1, 'approved', '{"mon":"9:00-19:00","tue":"9:00-19:00","wed":"9:00-19:00","thu":"9:00-19:00","fri":"9:00-19:00","sat":"9:00-17:00","sun":"closed"}'),

('Worli Pest Control Services', 'worli-pest-control', 'Professional pest control services in South Mumbai. Termite treatment, cockroach control, bed bug treatment, rodent control. Government approved chemicals. Safe for kids and pets.', 'Professional pest control - termite, cockroach, bed bug & rodent treatment.', '56, Worli Sea Face', @mumbai, @worli, @mh, '400018', '022-24501234', '9876543226', 'info@worlipest.com', NULL, 19.0176, 72.8152, 2014, NULL, 4.4, 22, 1, 0, 1, 'approved', '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"8:00-14:00","sun":"closed"}'),

-- Bangalore
('Bangalore Welding Works', 'bangalore-welding-works', 'Premium welding and fabrication services in Koramangala, Bangalore. Specializing in MS, SS, and aluminum welding. Custom gates, grills, railings, and industrial fabrication. ISO certified workshop.', 'Premium welding & fabrication. Custom gates, grills, railings. ISO certified.', '89, 1st Block, Koramangala', @bangalore, @koramangala, @ka, '560034', '080-41001234', '9876543215', 'info@blrwelding.com', NULL, 12.9352, 77.6245, 2007, NULL, 4.4, 23, 1, 1, 1, 'approved', '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"8:00-14:00","sun":"closed"}'),

('TechCool HVAC Bangalore', 'techcool-hvac-bangalore', 'Leading HVAC contractor in Bangalore. Central AC, VRF installations, commercial refrigeration, duct work for offices, malls, and factories. 50+ trained technicians serving all of Bangalore.', 'Leading HVAC contractor. Central AC, VRF, commercial refrigeration.', '234, Whitefield Main Road', @bangalore, @whitefield, @ka, '560066', '080-42001234', '9876543216', 'service@techcoolhvac.com', 'https://techcoolhvac.com', 12.9698, 77.7500, 2011, NULL, 4.8, 38, 1, 1, 1, 'approved', '{"mon":"8:00-19:00","tue":"8:00-19:00","wed":"8:00-19:00","thu":"8:00-19:00","fri":"8:00-19:00","sat":"9:00-17:00","sun":"closed"}'),

('Indiranagar Electrical Hub', 'indiranagar-electrical-hub', 'One-stop electrical services in Indiranagar, Bangalore. From basic wiring to smart home automation, LED installations, and solar panel setup. Residential and commercial projects.', 'One-stop electrical services. Smart home, LED & solar setup.', '56, 100 Feet Road, Indiranagar', @bangalore, @indiranagar, @ka, '560038', '080-43001234', '9876543217', 'hello@indiraelec.com', NULL, 12.9784, 77.6408, 2015, NULL, 4.1, 17, 1, 0, 1, 'approved', '{"mon":"9:00-19:00","tue":"9:00-19:00","wed":"9:00-19:00","thu":"9:00-19:00","fri":"9:00-19:00","sat":"9:00-15:00","sun":"closed"}'),

('HSR Waterproofing Experts', 'hsr-waterproofing-experts', 'Waterproofing specialists in HSR Layout, Bangalore. Terrace waterproofing, bathroom waterproofing, basement waterproofing, and wall dampness solutions. 10-year warranty on all work.', 'Waterproofing specialists. Terrace, bathroom, basement solutions. 10-year warranty.', '12, HSR Layout, Sector 2', @bangalore, @hsrlayout, @ka, '560102', '080-44001234', '9876543227', 'info@hsrwaterproof.com', NULL, 12.9116, 77.6474, 2013, NULL, 4.5, 19, 1, 0, 1, 'approved', '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"8:00-14:00","sun":"closed"}'),

-- Delhi
('Delhi Mechanical Engineers', 'delhi-mechanical-engineers', 'Complete mechanical engineering services in Delhi NCR. Industrial machinery installation, CNC machining, lathe work, and factory maintenance. Serving Dwarka, Janakpuri, and Palam areas.', 'Complete mechanical engineering. Industrial machinery & CNC machining.', '112, Sector 7, Dwarka', @delhi, @dwarka, @dl, '110075', '011-28001234', '9876543218', 'info@delhimechanical.com', 'https://delhimechanical.com', 28.5921, 77.0460, 2001, NULL, 4.5, 45, 1, 1, 1, 'approved', '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"8:00-14:00","sun":"closed"}'),

('SafeHome Fire Solutions', 'safehome-fire-solutions', 'Fire safety equipment and services in Delhi. Fire extinguisher, alarm systems, sprinklers, and fire safety audits. Government approved vendor for commercial and residential buildings.', 'Fire safety equipment & services. Government approved vendor.', '45, Rohini Sector 11', @delhi, @rohini, @dl, '110085', '011-27001234', '9876543219', 'info@safehomefire.com', NULL, 28.7318, 77.1069, 2009, NULL, 4.6, 29, 1, 0, 1, 'approved', '{"mon":"9:00-18:00","tue":"9:00-18:00","wed":"9:00-18:00","thu":"9:00-18:00","fri":"9:00-18:00","sat":"9:00-14:00","sun":"closed"}'),

('Saket Generator House', 'saket-generator-house', 'Generator sales, installation, and repair in South Delhi. Diesel and gas generators from 5KVA to 500KVA. AMC services, soundproof enclosures, and automatic transfer switches.', 'Generator sales, installation & repair. 5KVA to 500KVA. AMC services.', '78, Saket, Press Enclave Marg', @delhi, @saket, @dl, '110017', '011-29001234', '9876543228', 'info@saketgen.com', NULL, 28.5244, 77.2167, 2008, NULL, 4.3, 16, 1, 1, 1, 'approved', '{"mon":"9:00-18:00","tue":"9:00-18:00","wed":"9:00-18:00","thu":"9:00-18:00","fri":"9:00-18:00","sat":"9:00-15:00","sun":"closed"}'),

-- Chennai
('Chennai Solar Power Systems', 'chennai-solar-power-systems', 'Top solar panel installation company in Chennai. Residential and commercial solar solutions with government subsidy assistance. On-grid, off-grid, and hybrid systems. Free site survey.', 'Top solar panel installation. Government subsidy assistance. Free consultation.', '67, Anna Nagar East', @chennai, NULL, @tn, '600102', '044-26001234', '9876543220', 'info@chennaisolar.com', 'https://chennaisolar.com', 13.0860, 80.2090, 2014, NULL, 4.4, 33, 1, 1, 1, 'approved', '{"mon":"9:00-18:00","tue":"9:00-18:00","wed":"9:00-18:00","thu":"9:00-18:00","fri":"9:00-18:00","sat":"9:00-14:00","sun":"closed"}'),

-- Hyderabad
('Hyderabad Appliance Care', 'hyderabad-appliance-care', 'Expert home appliance repair in Hyderabad. Washing machine, refrigerator, microwave, geyser, and chimney repair for all brands. Same-day service with 90-day warranty on all repairs.', 'Expert appliance repair. Same-day service with 90-day warranty.', '23, Banjara Hills, Road No. 12', @hyderabad, NULL, @tg, '500034', '040-23001234', '9876543221', 'service@hydappliancecare.com', NULL, 17.4156, 78.4347, 2016, NULL, 4.3, 21, 1, 0, 1, 'approved', '{"mon":"8:00-20:00","tue":"8:00-20:00","wed":"8:00-20:00","thu":"8:00-20:00","fri":"8:00-20:00","sat":"8:00-20:00","sun":"9:00-17:00"}'),

-- Pune
('Pune Fabrication Hub', 'pune-fabrication-hub', 'Metal fabrication and structural steel works in Pune. Custom fabrication for factories, warehouses, residential projects. MS, SS fabrication, laser cutting, and powder coating.', 'Metal fabrication & structural steel. Laser cutting & powder coating.', '89, Hinjewadi Phase 1', @pune, NULL, @mh, '411057', '020-27001234', '9876543222', 'info@punefab.com', 'https://punefab.com', 18.5912, 73.7380, 2006, NULL, 4.7, 37, 1, 1, 1, 'approved', '{"mon":"7:00-19:00","tue":"7:00-19:00","wed":"7:00-19:00","thu":"7:00-19:00","fri":"7:00-19:00","sat":"7:00-15:00","sun":"closed"}'),

-- Ahmedabad
('Gujarat Pump House', 'gujarat-pump-house', 'Leading pump sales and service in Ahmedabad. Submersible, centrifugal, booster, and sewage pumps. Installation, repair, and AMC for industrial and agricultural pumps.', 'Leading pump sales & service. Installation, repair & AMC for all pump types.', '156, CG Road, Navrangpura', @ahmedabad, NULL, @gj, '380009', '079-26001234', '9876543223', 'info@gujaratpumphouse.com', NULL, 23.0339, 72.5614, 2004, NULL, 4.5, 26, 1, 0, 1, 'approved', '{"mon":"8:00-19:00","tue":"8:00-19:00","wed":"8:00-19:00","thu":"8:00-19:00","fri":"8:00-19:00","sat":"8:00-15:00","sun":"closed"}'),

-- Jaipur
('Royal CCTV & Security', 'royal-cctv-security-jaipur', 'CCTV installation and security systems in Jaipur. HD and IP cameras, access control, video door phones, and biometric attendance. 24/7 monitoring support.', 'CCTV & security systems. HD/IP cameras, access control. 24/7 monitoring.', '34, MI Road, C-Scheme', @jaipur, NULL, @rj, '302001', '0141-2601234', '9876543224', 'info@royalcctv.com', 'https://royalcctv.com', 26.9124, 75.7873, 2013, NULL, 4.2, 18, 1, 1, 1, 'approved', '{"mon":"9:00-19:00","tue":"9:00-19:00","wed":"9:00-19:00","thu":"9:00-19:00","fri":"9:00-19:00","sat":"9:00-16:00","sun":"closed"}'),

-- Kolkata
('Kolkata Elevator Services', 'kolkata-elevator-services', 'Elevator and lift installation, modernization, and maintenance in Kolkata. Passenger lifts, goods lifts, and hospital lifts. PESO certified. AMC plans with 4-hour response time.', 'Elevator installation, modernization & maintenance. PESO certified. 4hr response.', '90, Park Street, Kolkata', (SELECT id FROM cities WHERE slug='kolkata'), NULL, (SELECT id FROM states WHERE slug='west-bengal'), '700016', '033-22001234', '9876543229', 'info@kolkatalift.com', NULL, 22.5519, 88.3527, 2005, NULL, 4.6, 31, 1, 1, 1, 'approved', '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"8:00-14:00","sun":"closed"}');


-- Map businesses to categories
INSERT INTO business_categories (business_id, category_id, is_primary) VALUES
((SELECT id FROM businesses WHERE slug='sharma-plumbing-solutions'), (SELECT id FROM categories WHERE slug='plumbing-services'), 1),
((SELECT id FROM businesses WHERE slug='sharma-plumbing-solutions'), (SELECT id FROM categories WHERE slug='pipe-fitting'), 0),
((SELECT id FROM businesses WHERE slug='sharma-plumbing-solutions'), (SELECT id FROM categories WHERE slug='bathroom-plumbing'), 0),
((SELECT id FROM businesses WHERE slug='quick-fix-plumbers'), (SELECT id FROM categories WHERE slug='plumbing-services'), 1),
((SELECT id FROM businesses WHERE slug='quick-fix-plumbers'), (SELECT id FROM categories WHERE slug='drainage-sewage'), 0),
((SELECT id FROM businesses WHERE slug='bright-spark-electricals'), (SELECT id FROM categories WHERE slug='electrical-services'), 1),
((SELECT id FROM businesses WHERE slug='bright-spark-electricals'), (SELECT id FROM categories WHERE slug='house-wiring'), 0),
((SELECT id FROM businesses WHERE slug='bright-spark-electricals'), (SELECT id FROM categories WHERE slug='switchboard-panel'), 0),
((SELECT id FROM businesses WHERE slug='cool-breeze-ac-services'), (SELECT id FROM categories WHERE slug='hvac-services'), 1),
((SELECT id FROM businesses WHERE slug='cool-breeze-ac-services'), (SELECT id FROM categories WHERE slug='ac-installation'), 0),
((SELECT id FROM businesses WHERE slug='cool-breeze-ac-services'), (SELECT id FROM categories WHERE slug='ac-repair'), 0),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), (SELECT id FROM categories WHERE slug='auto-mechanic'), 1),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), (SELECT id FROM categories WHERE slug='car-service'), 0),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), (SELECT id FROM categories WHERE slug='denting-painting'), 0),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), (SELECT id FROM categories WHERE slug='engine-repair'), 0),
((SELECT id FROM businesses WHERE slug='malad-ro-water-solutions'), (SELECT id FROM categories WHERE slug='ro-water-purifier'), 1),
((SELECT id FROM businesses WHERE slug='worli-pest-control'), (SELECT id FROM categories WHERE slug='pest-control'), 1),
((SELECT id FROM businesses WHERE slug='bangalore-welding-works'), (SELECT id FROM categories WHERE slug='welding-services'), 1),
((SELECT id FROM businesses WHERE slug='bangalore-welding-works'), (SELECT id FROM categories WHERE slug='fabrication-services'), 0),
((SELECT id FROM businesses WHERE slug='techcool-hvac-bangalore'), (SELECT id FROM categories WHERE slug='hvac-services'), 1),
((SELECT id FROM businesses WHERE slug='techcool-hvac-bangalore'), (SELECT id FROM categories WHERE slug='ac-installation'), 0),
((SELECT id FROM businesses WHERE slug='techcool-hvac-bangalore'), (SELECT id FROM categories WHERE slug='refrigeration'), 0),
((SELECT id FROM businesses WHERE slug='indiranagar-electrical-hub'), (SELECT id FROM categories WHERE slug='electrical-services'), 1),
((SELECT id FROM businesses WHERE slug='indiranagar-electrical-hub'), (SELECT id FROM categories WHERE slug='led-lighting'), 0),
((SELECT id FROM businesses WHERE slug='indiranagar-electrical-hub'), (SELECT id FROM categories WHERE slug='solar-panel-services'), 0),
((SELECT id FROM businesses WHERE slug='hsr-waterproofing-experts'), (SELECT id FROM categories WHERE slug='waterproofing'), 1),
((SELECT id FROM businesses WHERE slug='delhi-mechanical-engineers'), (SELECT id FROM categories WHERE slug='industrial-machinery'), 1),
((SELECT id FROM businesses WHERE slug='delhi-mechanical-engineers'), (SELECT id FROM categories WHERE slug='cnc-machining'), 0),
((SELECT id FROM businesses WHERE slug='safehome-fire-solutions'), (SELECT id FROM categories WHERE slug='fire-safety-services'), 1),
((SELECT id FROM businesses WHERE slug='saket-generator-house'), (SELECT id FROM categories WHERE slug='generator-services'), 1),
((SELECT id FROM businesses WHERE slug='chennai-solar-power-systems'), (SELECT id FROM categories WHERE slug='solar-panel-services'), 1),
((SELECT id FROM businesses WHERE slug='hyderabad-appliance-care'), (SELECT id FROM categories WHERE slug='appliance-repair'), 1),
((SELECT id FROM businesses WHERE slug='hyderabad-appliance-care'), (SELECT id FROM categories WHERE slug='washing-machine-repair'), 0),
((SELECT id FROM businesses WHERE slug='hyderabad-appliance-care'), (SELECT id FROM categories WHERE slug='refrigerator-repair'), 0),
((SELECT id FROM businesses WHERE slug='pune-fabrication-hub'), (SELECT id FROM categories WHERE slug='fabrication-services'), 1),
((SELECT id FROM businesses WHERE slug='pune-fabrication-hub'), (SELECT id FROM categories WHERE slug='welding-services'), 0),
((SELECT id FROM businesses WHERE slug='gujarat-pump-house'), (SELECT id FROM categories WHERE slug='pump-services'), 1),
((SELECT id FROM businesses WHERE slug='royal-cctv-security-jaipur'), (SELECT id FROM categories WHERE slug='cctv-security'), 1),
((SELECT id FROM businesses WHERE slug='kolkata-elevator-services'), (SELECT id FROM categories WHERE slug='elevator-lift-services'), 1);


-- Sample Reviews
INSERT INTO reviews (business_id, user_id, rating, title, comment, is_approved, created_at) VALUES
((SELECT id FROM businesses WHERE slug='sharma-plumbing-solutions'), 3, 5, 'Excellent service!', 'Called them for an emergency pipe burst at midnight. They arrived within 30 minutes and fixed it perfectly. Very professional team. Highly recommended!', 1, '2026-01-15 10:30:00'),
((SELECT id FROM businesses WHERE slug='sharma-plumbing-solutions'), 3, 4, 'Good work', 'Got our entire bathroom plumbing redone. Quality work at reasonable prices. Only issue was slight delay in completing the work.', 1, '2026-02-20 14:15:00'),
((SELECT id FROM businesses WHERE slug='bright-spark-electricals'), 3, 5, 'Best electricians in Mumbai', 'Rewired our entire 3BHK flat. Clean work, proper safety measures, and they cleaned up after themselves. Will definitely use again.', 1, '2026-01-28 09:45:00'),
((SELECT id FROM businesses WHERE slug='bright-spark-electricals'), 3, 5, 'Professional and reliable', 'Installed a new distribution panel and inverter system. The team was knowledgeable and explained everything clearly. Fair pricing.', 1, '2026-03-05 11:20:00'),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), 3, 5, 'Trusted garage for years', 'Been servicing my car here for 5 years. Always honest about what needs fixing. Never try to upsell unnecessary repairs.', 1, '2026-02-10 16:30:00'),
((SELECT id FROM businesses WHERE slug='autocare-garage-mumbai'), 3, 4, 'Great denting work', 'Got major dent repair and painting done. The finish was factory-like. Took 4 days instead of promised 3, but quality was worth the wait.', 1, '2026-03-01 13:00:00'),
((SELECT id FROM businesses WHERE slug='techcool-hvac-bangalore'), 3, 5, 'Top class HVAC work', 'Installed central AC for our entire office building. The team was professional, completed on time, and the system works flawlessly.', 1, '2026-02-15 10:00:00'),
((SELECT id FROM businesses WHERE slug='pune-fabrication-hub'), 3, 5, 'Excellent fabrication work', 'Custom fabricated a staircase railing and main gate. The quality of welding and finishing is outstanding. Very creative designs.', 1, '2026-01-20 15:30:00'),
((SELECT id FROM businesses WHERE slug='delhi-mechanical-engineers'), 3, 4, 'Reliable industrial services', 'They installed CNC machines in our factory. Good technical knowledge. Post-installation support has been excellent.', 1, '2026-02-25 11:45:00'),
((SELECT id FROM businesses WHERE slug='chennai-solar-power-systems'), 3, 5, 'Great solar installation', 'Installed 5KW solar system on our rooftop. They handled all paperwork for government subsidy. System generating more power than expected!', 1, '2026-03-10 09:15:00');

-- ==============================================
-- ADMIN USER (password: Admin@123)
-- ==============================================

INSERT INTO users (full_name, email, phone, password, role, is_active, email_verified_at, created_at, updated_at) VALUES
('Super Admin', 'admin@servora.com', '9999999999', '$2y$12$LGUShckhotOh16KKUKBeg.OJgUZHdZbiptvbrqvh.2dIkG0zzs8IW', 'super_admin', 1, NOW(), NOW(), NOW()),
('Demo Owner', 'owner@servora.com', '8888888888', '$2y$12$LGUShckhotOh16KKUKBeg.OJgUZHdZbiptvbrqvh.2dIkG0zzs8IW', 'business_owner', 1, NOW(), NOW(), NOW()),
('Test User', 'user@servora.com', '7777777777', '$2y$12$LGUShckhotOh16KKUKBeg.OJgUZHdZbiptvbrqvh.2dIkG0zzs8IW', 'user', 1, NOW(), NOW(), NOW());
