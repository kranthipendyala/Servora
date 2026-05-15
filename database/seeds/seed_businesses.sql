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
