-- Seed: Home Services Categories (Home Cleaning + subcategories for marketplace)
-- Run AFTER seed_categories.sql

-- Add Home Cleaning as a new parent category
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
('Home Cleaning', 'home-cleaning', 'sparkles', 'Professional home cleaning, deep cleaning and sanitization services', 21);

-- Sub-categories: Home Cleaning
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Full Home Cleaning', 'full-home-cleaning', 'sparkles', 'Complete home deep cleaning including all rooms, kitchen and bathrooms', 1),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Kitchen Cleaning', 'kitchen-cleaning', 'sparkles', 'Kitchen deep cleaning, chimney cleaning and degreasing', 2),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Bathroom Cleaning', 'bathroom-cleaning', 'sparkles', 'Bathroom deep cleaning, tile scrubbing and sanitization', 3),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Sofa & Carpet Cleaning', 'sofa-carpet-cleaning', 'sparkles', 'Sofa shampooing, carpet cleaning and upholstery care', 4),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Water Tank Cleaning', 'water-tank-cleaning', 'sparkles', 'Overhead and underground water tank cleaning and disinfection', 5),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Office Cleaning', 'office-cleaning', 'sparkles', 'Commercial and office space cleaning services', 6),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Post-Construction Cleaning', 'post-construction-cleaning', 'sparkles', 'After renovation or construction site cleanup', 7),
((SELECT id FROM categories WHERE slug='home-cleaning'), 'Move In/Out Cleaning', 'move-in-out-cleaning', 'sparkles', 'Deep cleaning when moving into or out of a home', 8);

-- Sub-categories: AC Repair (add more specific home-service focused ones under HVAC)
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='hvac-services'), 'AC AMC Plans', 'ac-amc-plans', 'thermometer', 'Annual maintenance contracts for AC units', 5),
((SELECT id FROM categories WHERE slug='hvac-services'), 'AC Gas Refill', 'ac-gas-refill', 'thermometer', 'AC gas charging and refrigerant refill', 6);

-- Sub-categories: Electrical (add home-focused ones)
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='electrical-services'), 'Fan Installation & Repair', 'fan-installation-repair', 'zap', 'Ceiling fan, exhaust fan installation and repair', 6),
((SELECT id FROM categories WHERE slug='electrical-services'), 'Doorbell & Intercom', 'doorbell-intercom', 'zap', 'Video doorbell and intercom system installation', 7);

-- Sub-categories: Plumbing (add home-focused ones)
INSERT INTO categories (parent_id, name, slug, icon, description, sort_order) VALUES
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Tap & Mixer Repair', 'tap-mixer-repair', 'wrench', 'Tap installation, mixer repair and replacement', 6),
((SELECT id FROM categories WHERE slug='plumbing-services'), 'Water Purifier Service', 'water-purifier-service', 'wrench', 'RO water purifier installation and servicing', 7);
