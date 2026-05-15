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
