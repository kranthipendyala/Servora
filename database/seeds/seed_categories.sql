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
