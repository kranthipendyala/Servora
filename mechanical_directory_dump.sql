-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mechanical_directory
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `full_name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city_id` int(10) unsigned DEFAULT NULL,
  `locality_id` int(10) unsigned DEFAULT NULL,
  `state_id` int(10) unsigned DEFAULT NULL,
  `pin_code` varchar(10) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `city_id` (`city_id`),
  KEY `locality_id` (`locality_id`),
  KEY `state_id` (`state_id`),
  KEY `idx_addr_user` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `addresses_ibfk_3` FOREIGN KEY (`locality_id`) REFERENCES `localities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `addresses_ibfk_4` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_items`
--

DROP TABLE IF EXISTS `booking_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` int(10) unsigned NOT NULL,
  `service_id` int(10) unsigned NOT NULL,
  `variant_id` int(10) unsigned DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `variant_name` varchar(150) DEFAULT NULL,
  `quantity` int(10) unsigned DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_bi_booking` (`booking_id`),
  CONSTRAINT `booking_items_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_items_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `booking_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `service_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_items`
--

LOCK TABLES `booking_items` WRITE;
/*!40000 ALTER TABLE `booking_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_reviews`
--

DROP TABLE IF EXISTS `booking_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` int(10) unsigned NOT NULL,
  `customer_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  `comment` text DEFAULT NULL,
  `vendor_reply` text DEFAULT NULL,
  `vendor_replied_at` datetime DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_br_vendor` (`vendor_id`,`rating`),
  CONSTRAINT `booking_reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `booking_reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `booking_reviews_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_reviews`
--

LOCK TABLES `booking_reviews` WRITE;
/*!40000 ALTER TABLE `booking_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_number` varchar(20) NOT NULL,
  `customer_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `business_id` int(10) unsigned NOT NULL,
  `address_id` int(10) unsigned DEFAULT NULL,
  `service_address` text DEFAULT NULL,
  `service_latitude` decimal(10,7) DEFAULT NULL,
  `service_longitude` decimal(10,7) DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('pending','confirmed','assigned','in_progress','completed','cancelled','refunded') DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `platform_fee` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT 0.00,
  `commission_amount` decimal(10,2) DEFAULT 0.00,
  `vendor_payout_amount` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('pending','paid','cod','partially_refunded','refunded','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `cancelled_by` enum('customer','vendor','admin') DEFAULT NULL,
  `customer_notes` text DEFAULT NULL,
  `vendor_notes` text DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_number` (`booking_number`),
  KEY `business_id` (`business_id`),
  KEY `address_id` (`address_id`),
  KEY `idx_book_customer` (`customer_id`,`status`),
  KEY `idx_book_vendor` (`vendor_id`,`status`),
  KEY `idx_book_status` (`status`),
  KEY `idx_book_date` (`scheduled_date`),
  KEY `idx_book_number` (`booking_number`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`),
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_categories`
--

DROP TABLE IF EXISTS `business_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_categories` (
  `business_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`business_id`,`category_id`),
  KEY `idx_bc_category` (`category_id`),
  KEY `idx_bc_primary` (`is_primary`),
  CONSTRAINT `business_categories_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `business_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_categories`
--

LOCK TABLES `business_categories` WRITE;
/*!40000 ALTER TABLE `business_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_claims`
--

DROP TABLE IF EXISTS `business_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_claims` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `proof_document` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `reviewed_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_claim_status` (`status`),
  KEY `idx_claim_business` (`business_id`),
  CONSTRAINT `business_claims_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `business_claims_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_claims`
--

LOCK TABLES `business_claims` WRITE;
/*!40000 ALTER TABLE `business_claims` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_images`
--

DROP TABLE IF EXISTS `business_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int(10) unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bimg_business` (`business_id`),
  CONSTRAINT `business_images_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_images`
--

LOCK TABLES `business_images` WRITE;
/*!40000 ALTER TABLE `business_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city_id` int(10) unsigned NOT NULL,
  `locality_id` int(10) unsigned DEFAULT NULL,
  `state_id` int(10) unsigned NOT NULL,
  `pin_code` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `year_established` year(4) DEFAULT NULL,
  `owner_user_id` int(10) unsigned DEFAULT NULL,
  `avg_rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `business_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_hours`)),
  `social_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_links`)),
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_biz_slug` (`slug`),
  KEY `idx_biz_city` (`city_id`),
  KEY `idx_biz_locality` (`locality_id`),
  KEY `idx_biz_state` (`state_id`),
  KEY `idx_biz_status` (`status`,`is_active`),
  KEY `idx_biz_featured` (`is_featured`,`is_active`),
  KEY `idx_biz_rating` (`avg_rating`),
  FULLTEXT KEY `idx_biz_search` (`name`,`description`,`short_description`),
  CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`),
  CONSTRAINT `businesses_ibfk_2` FOREIGN KEY (`locality_id`) REFERENCES `localities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `businesses_ibfk_3` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_cat_slug` (`slug`),
  KEY `idx_cat_parent` (`parent_id`),
  KEY `idx_cat_sort` (`sort_order`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Plumbing Services','plumbing-services','wrench','Professional plumbing repair, installation and maintenance services',NULL,NULL,1,1,'2026-03-25 11:17:37'),(2,NULL,'Electrical Services','electrical-services','zap','Certified electricians for residential and commercial electrical work',NULL,NULL,2,1,'2026-03-25 11:17:37'),(3,NULL,'HVAC Services','hvac-services','thermometer','Heating, ventilation and air conditioning installation and repair',NULL,NULL,3,1,'2026-03-25 11:17:37'),(4,NULL,'Auto Mechanic','auto-mechanic','car','Automobile repair, maintenance and servicing',NULL,NULL,4,1,'2026-03-25 11:17:37'),(5,NULL,'Welding Services','welding-services','flame','Professional welding, fabrication and metalwork services',NULL,NULL,5,1,'2026-03-25 11:17:37'),(6,NULL,'Carpentry Services','carpentry-services','hammer','Skilled carpenters for furniture, doors, windows and woodwork',NULL,NULL,6,1,'2026-03-25 11:17:37'),(7,NULL,'Painting Services','painting-services','paintbrush','Interior and exterior painting, wall textures and coatings',NULL,NULL,7,1,'2026-03-25 11:17:37'),(8,NULL,'Appliance Repair','appliance-repair','settings','Home and commercial appliance repair and servicing',NULL,NULL,8,1,'2026-03-25 11:17:37'),(9,NULL,'Elevator & Lift Services','elevator-lift-services','arrow-up','Elevator installation, maintenance and repair',NULL,NULL,9,1,'2026-03-25 11:17:37'),(10,NULL,'Generator Services','generator-services','battery','Generator installation, repair and maintenance',NULL,NULL,10,1,'2026-03-25 11:17:37'),(11,NULL,'Pump Services','pump-services','droplet','Water pump, submersible pump installation and repair',NULL,NULL,11,1,'2026-03-25 11:17:37'),(12,NULL,'Industrial Machinery','industrial-machinery','cog','Industrial machine installation, repair and maintenance',NULL,NULL,12,1,'2026-03-25 11:17:37'),(13,NULL,'CNC & Machining','cnc-machining','cpu','CNC machining, lathe work and precision engineering',NULL,NULL,13,1,'2026-03-25 11:17:37'),(14,NULL,'Fabrication Services','fabrication-services','layers','Metal fabrication, steel structures and custom metalwork',NULL,NULL,14,1,'2026-03-25 11:17:37'),(15,NULL,'Solar Panel Services','solar-panel-services','sun','Solar panel installation, maintenance and repair',NULL,NULL,15,1,'2026-03-25 11:17:37'),(16,NULL,'Fire Safety Services','fire-safety-services','shield','Fire extinguisher, fire alarm and suppression system services',NULL,NULL,16,1,'2026-03-25 11:17:37'),(17,NULL,'Pest Control','pest-control','bug','Residential and commercial pest control services',NULL,NULL,17,1,'2026-03-25 11:17:37'),(18,NULL,'Waterproofing','waterproofing','umbrella','Waterproofing solutions for roofs, walls and basements',NULL,NULL,18,1,'2026-03-25 11:17:37'),(19,NULL,'RO & Water Purifier','ro-water-purifier','filter','RO system installation, repair and AMC services',NULL,NULL,19,1,'2026-03-25 11:17:37'),(20,NULL,'CCTV & Security','cctv-security','camera','CCTV installation, security systems and access control',NULL,NULL,20,1,'2026-03-25 11:17:37'),(21,1,'Pipe Fitting','pipe-fitting','wrench','Pipe installation, repair and replacement',NULL,NULL,1,1,'2026-03-25 11:18:08'),(22,1,'Bathroom Plumbing','bathroom-plumbing','wrench','Toilet, shower, basin and bathroom fixture work',NULL,NULL,2,1,'2026-03-25 11:18:08'),(23,1,'Drainage & Sewage','drainage-sewage','wrench','Drain cleaning, sewage line repair and maintenance',NULL,NULL,3,1,'2026-03-25 11:18:08'),(24,1,'Water Tank Services','water-tank-services','wrench','Water tank installation, cleaning and repair',NULL,NULL,4,1,'2026-03-25 11:18:08'),(25,1,'Gas Pipeline','gas-pipeline','wrench','Gas pipeline installation and leak repair',NULL,NULL,5,1,'2026-03-25 11:18:08'),(26,2,'House Wiring','house-wiring','zap','Complete home electrical wiring and rewiring',NULL,NULL,1,1,'2026-03-25 11:18:08'),(27,2,'Switchboard & Panel','switchboard-panel','zap','Switchboard installation and distribution panel work',NULL,NULL,2,1,'2026-03-25 11:18:08'),(28,2,'Inverter & UPS','inverter-ups','zap','Inverter and UPS installation and repair',NULL,NULL,3,1,'2026-03-25 11:18:08'),(29,2,'Industrial Electrical','industrial-electrical','zap','Factory and industrial electrical installations',NULL,NULL,4,1,'2026-03-25 11:18:08'),(30,2,'LED & Lighting','led-lighting','zap','LED installation, decorative and commercial lighting',NULL,NULL,5,1,'2026-03-25 11:18:08'),(31,3,'AC Installation','ac-installation','thermometer','Split AC, window AC and central AC installation',NULL,NULL,1,1,'2026-03-25 11:18:08'),(32,3,'AC Repair','ac-repair','thermometer','AC servicing, gas refill and repair',NULL,NULL,2,1,'2026-03-25 11:18:08'),(33,3,'Refrigeration','refrigeration','thermometer','Commercial refrigeration and cold storage systems',NULL,NULL,3,1,'2026-03-25 11:18:08'),(34,3,'Duct Work','duct-work','thermometer','HVAC duct installation and cleaning',NULL,NULL,4,1,'2026-03-25 11:18:08'),(35,4,'Car Service','car-service','car','General car servicing and maintenance',NULL,NULL,1,1,'2026-03-25 11:18:08'),(36,4,'Two Wheeler Repair','two-wheeler-repair','car','Bike and scooter repair and servicing',NULL,NULL,2,1,'2026-03-25 11:18:08'),(37,4,'Denting & Painting','denting-painting','car','Vehicle body repair, denting and painting',NULL,NULL,3,1,'2026-03-25 11:18:08'),(38,4,'Tyre & Wheel','tyre-wheel','car','Tyre replacement, wheel alignment and balancing',NULL,NULL,4,1,'2026-03-25 11:18:08'),(39,4,'Engine Repair','engine-repair','car','Engine overhaul, tuning and repair',NULL,NULL,5,1,'2026-03-25 11:18:08'),(40,8,'Washing Machine Repair','washing-machine-repair','settings','All brands washing machine repair and service',NULL,NULL,1,1,'2026-03-25 11:18:08'),(41,8,'Refrigerator Repair','refrigerator-repair','settings','Fridge repair, gas charging and compressor work',NULL,NULL,2,1,'2026-03-25 11:18:08'),(42,8,'Microwave & Oven Repair','microwave-oven-repair','settings','Microwave, OTG and oven repair services',NULL,NULL,3,1,'2026-03-25 11:18:08'),(43,8,'Geyser Repair','geyser-repair','settings','Water heater and geyser installation and repair',NULL,NULL,4,1,'2026-03-25 11:18:08'),(44,8,'Chimney & Hob Repair','chimney-hob-repair','settings','Kitchen chimney and gas hob servicing',NULL,NULL,5,1,'2026-03-25 11:18:08'),(45,NULL,'Home Cleaning','home-cleaning','sparkles','Professional home cleaning, deep cleaning and sanitization services',NULL,NULL,21,1,'2026-03-30 11:18:20'),(47,45,'Full Home Cleaning','full-home-cleaning','sparkles','Complete home deep cleaning',NULL,NULL,1,1,'2026-03-30 11:18:37'),(48,45,'Kitchen Cleaning','kitchen-cleaning','sparkles','Kitchen deep cleaning and degreasing',NULL,NULL,2,1,'2026-03-30 11:18:37'),(49,45,'Bathroom Cleaning','bathroom-cleaning','sparkles','Bathroom deep cleaning and sanitization',NULL,NULL,3,1,'2026-03-30 11:18:37'),(50,45,'Sofa & Carpet Cleaning','sofa-carpet-cleaning','sparkles','Sofa shampooing and carpet cleaning',NULL,NULL,4,1,'2026-03-30 11:18:37'),(51,45,'Office Cleaning','office-cleaning','sparkles','Commercial and office space cleaning',NULL,NULL,5,1,'2026-03-30 11:18:37'),(52,45,'Post-Construction Cleaning','post-construction-cleaning','sparkles','After renovation cleanup',NULL,NULL,6,1,'2026-03-30 11:18:37');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_conversations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` int(10) unsigned NOT NULL,
  `customer_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_chat_booking` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `chat_conversations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chat_conversations_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` int(10) unsigned NOT NULL,
  `sender_id` int(10) unsigned NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','image','system') DEFAULT 'text',
  `image_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_msg_conv` (`conversation_id`,`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `state_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_city_slug` (`slug`),
  KEY `idx_city_state` (`state_id`),
  KEY `idx_city_active` (`is_active`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,1,'Mumbai','mumbai',NULL,NULL,1,19.0760000,72.8777000,'2026-03-25 11:17:37'),(2,1,'Pune','pune',NULL,NULL,1,18.5204000,73.8567000,'2026-03-25 11:17:37'),(3,1,'Nagpur','nagpur',NULL,NULL,1,21.1458000,79.0882000,'2026-03-25 11:17:37'),(4,1,'Thane','thane',NULL,NULL,1,19.2183000,72.9781000,'2026-03-25 11:17:37'),(5,1,'Nashik','nashik',NULL,NULL,1,19.9975000,73.7898000,'2026-03-25 11:17:37'),(6,2,'New Delhi','new-delhi',NULL,NULL,1,28.6139000,77.2090000,'2026-03-25 11:17:37'),(7,3,'Bangalore','bangalore',NULL,NULL,1,12.9716000,77.5946000,'2026-03-25 11:17:37'),(8,3,'Mysore','mysore',NULL,NULL,1,12.2958000,76.6394000,'2026-03-25 11:17:37'),(9,4,'Chennai','chennai',NULL,NULL,1,13.0827000,80.2707000,'2026-03-25 11:17:37'),(10,4,'Coimbatore','coimbatore',NULL,NULL,1,11.0168000,76.9558000,'2026-03-25 11:17:37'),(11,4,'Madurai','madurai',NULL,NULL,1,9.9252000,78.1198000,'2026-03-25 11:17:37'),(12,5,'Hyderabad','hyderabad',NULL,NULL,1,17.3850000,78.4867000,'2026-03-25 11:17:37'),(13,6,'Ahmedabad','ahmedabad',NULL,NULL,1,23.0225000,72.5714000,'2026-03-25 11:17:37'),(14,6,'Surat','surat',NULL,NULL,1,21.1702000,72.8311000,'2026-03-25 11:17:37'),(15,6,'Vadodara','vadodara',NULL,NULL,1,22.3072000,73.1812000,'2026-03-25 11:17:37'),(16,7,'Jaipur','jaipur',NULL,NULL,1,26.9124000,75.7873000,'2026-03-25 11:17:37'),(17,7,'Jodhpur','jodhpur',NULL,NULL,1,26.2389000,73.0243000,'2026-03-25 11:17:37'),(18,7,'Udaipur','udaipur',NULL,NULL,1,24.5854000,73.7125000,'2026-03-25 11:17:37'),(19,8,'Lucknow','lucknow',NULL,NULL,1,26.8467000,80.9462000,'2026-03-25 11:17:37'),(20,8,'Noida','noida',NULL,NULL,1,28.5355000,77.3910000,'2026-03-25 11:17:37'),(21,8,'Kanpur','kanpur',NULL,NULL,1,26.4499000,80.3319000,'2026-03-25 11:17:37'),(22,8,'Varanasi','varanasi',NULL,NULL,1,25.3176000,82.9739000,'2026-03-25 11:17:37'),(23,9,'Kolkata','kolkata',NULL,NULL,1,22.5726000,88.3639000,'2026-03-25 11:17:37'),(24,10,'Indore','indore',NULL,NULL,1,22.7196000,75.8577000,'2026-03-25 11:17:37'),(25,10,'Bhopal','bhopal',NULL,NULL,1,23.2599000,77.4126000,'2026-03-25 11:17:37'),(26,11,'Kochi','kochi',NULL,NULL,1,9.9312000,76.2673000,'2026-03-25 11:17:37'),(27,11,'Thiruvananthapuram','thiruvananthapuram',NULL,NULL,1,8.5241000,76.9366000,'2026-03-25 11:17:37'),(28,12,'Chandigarh','chandigarh',NULL,NULL,1,30.7333000,76.7794000,'2026-03-25 11:17:37'),(29,12,'Ludhiana','ludhiana',NULL,NULL,1,30.9010000,75.8573000,'2026-03-25 11:17:37'),(30,13,'Gurgaon','gurgaon',NULL,NULL,1,28.4595000,77.0266000,'2026-03-25 11:17:37'),(31,13,'Faridabad','faridabad',NULL,NULL,1,28.4089000,77.3178000,'2026-03-25 11:17:37'),(32,14,'Patna','patna',NULL,NULL,1,25.6093000,85.1376000,'2026-03-25 11:17:37'),(33,15,'Bhubaneswar','bhubaneswar',NULL,NULL,1,20.2961000,85.8245000,'2026-03-25 11:17:37'),(34,16,'Visakhapatnam','visakhapatnam',NULL,NULL,1,17.6868000,83.2185000,'2026-03-25 11:17:37'),(35,16,'Vijayawada','vijayawada',NULL,NULL,1,16.5062000,80.6480000,'2026-03-25 11:17:37'),(36,20,'Panaji','panaji',NULL,NULL,1,15.4909000,73.8278000,'2026-03-25 11:17:37'),(37,5,'Warangal','warangal',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(38,5,'Nizamabad','nizamabad',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(39,5,'Karimnagar','karimnagar',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(40,5,'Khammam','khammam',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(41,5,'Secunderabad','secunderabad',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(42,5,'Nalgonda','nalgonda',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(43,5,'Adilabad','adilabad',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(44,5,'Mahabubnagar','mahabubnagar',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(45,5,'Medak','medak',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(46,5,'Rangareddy','rangareddy',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(47,5,'Sangareddy','sangareddy',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(48,5,'Siddipet','siddipet',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(49,5,'Mancherial','mancherial',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(50,5,'Suryapet','suryapet',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15'),(51,5,'Ramagundam','ramagundam',NULL,NULL,1,NULL,NULL,'2026-03-30 18:20:15');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_rules`
--

DROP TABLE IF EXISTS `commission_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commission_rules` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned DEFAULT NULL,
  `commission_percentage` decimal(5,2) NOT NULL DEFAULT 15.00,
  `min_commission` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_comm_cat` (`category_id`),
  CONSTRAINT `commission_rules_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_rules`
--

LOCK TABLES `commission_rules` WRITE;
/*!40000 ALTER TABLE `commission_rules` DISABLE KEYS */;
INSERT INTO `commission_rules` VALUES (1,NULL,15.00,50.00,1,'2026-03-30 11:18:13');
/*!40000 ALTER TABLE `commission_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `per_user_limit` int(11) DEFAULT 1,
  `category_id` int(10) unsigned DEFAULT NULL,
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `category_id` (`category_id`),
  KEY `idx_coupon_code` (`code`),
  KEY `idx_coupon_dates` (`valid_from`,`valid_until`),
  CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME50','Get 50% off on your first booking','percentage',50.00,200.00,299.00,1000,0,1,NULL,'2026-03-30 11:31:14','2026-06-28 11:31:14',1,'2026-03-30 11:31:14'),(2,'FLAT100','Flat Rs.100 off on orders above Rs.500','fixed',100.00,NULL,500.00,500,0,1,NULL,'2026-03-30 11:31:14','2026-05-29 11:31:14',1,'2026-03-30 11:31:14'),(3,'CLEAN20','20% off on cleaning services','percentage',20.00,300.00,499.00,NULL,0,1,NULL,'2026-03-30 11:31:14','2026-04-29 11:31:14',1,'2026-03-30 11:31:14');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leads` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lead_number` varchar(20) NOT NULL,
  `customer_id` int(10) unsigned DEFAULT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `business_id` int(10) unsigned NOT NULL,
  `contact_method` enum('call','whatsapp','enquiry') NOT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','contacted','converted','closed') DEFAULT 'new',
  `lead_fee` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_number` (`lead_number`),
  KEY `idx_lead_vendor` (`vendor_id`),
  KEY `idx_lead_business` (`business_id`),
  KEY `idx_lead_status` (`status`),
  KEY `idx_lead_date` (`created_at`),
  CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `localities`
--

DROP TABLE IF EXISTS `localities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `localities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `city_id` int(10) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `pin_code` varchar(10) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_locality_city_slug` (`city_id`,`slug`),
  KEY `idx_locality_city` (`city_id`),
  CONSTRAINT `localities_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localities`
--

LOCK TABLES `localities` WRITE;
/*!40000 ALTER TABLE `localities` DISABLE KEYS */;
INSERT INTO `localities` VALUES (1,1,'Andheri','andheri','400058',NULL,NULL,1,'2026-03-25 11:17:37'),(2,1,'Bandra','bandra','400050',NULL,NULL,1,'2026-03-25 11:17:37'),(3,1,'Borivali','borivali','400066',NULL,NULL,1,'2026-03-25 11:17:37'),(4,1,'Dadar','dadar','400014',NULL,NULL,1,'2026-03-25 11:17:37'),(5,1,'Goregaon','goregaon','400062',NULL,NULL,1,'2026-03-25 11:17:37'),(6,1,'Malad','malad','400064',NULL,NULL,1,'2026-03-25 11:17:37'),(7,1,'Powai','powai','400076',NULL,NULL,1,'2026-03-25 11:17:37'),(8,1,'Thane West','thane-west','400601',NULL,NULL,1,'2026-03-25 11:17:37'),(9,1,'Worli','worli','400018',NULL,NULL,1,'2026-03-25 11:17:37'),(10,1,'Lower Parel','lower-parel','400013',NULL,NULL,1,'2026-03-25 11:17:37'),(11,7,'Koramangala','koramangala','560034',NULL,NULL,1,'2026-03-25 11:17:37'),(12,7,'Whitefield','whitefield','560066',NULL,NULL,1,'2026-03-25 11:17:37'),(13,7,'Indiranagar','indiranagar','560038',NULL,NULL,1,'2026-03-25 11:17:37'),(14,7,'HSR Layout','hsr-layout','560102',NULL,NULL,1,'2026-03-25 11:17:37'),(15,7,'Electronic City','electronic-city','560100',NULL,NULL,1,'2026-03-25 11:17:37'),(16,7,'Jayanagar','jayanagar','560041',NULL,NULL,1,'2026-03-25 11:17:37'),(17,7,'Marathahalli','marathahalli','560037',NULL,NULL,1,'2026-03-25 11:17:37'),(18,7,'BTM Layout','btm-layout','560076',NULL,NULL,1,'2026-03-25 11:17:37'),(19,6,'Dwarka','dwarka','110075',NULL,NULL,1,'2026-03-25 11:17:37'),(20,6,'Rohini','rohini','110085',NULL,NULL,1,'2026-03-25 11:17:37'),(21,6,'Karol Bagh','karol-bagh','110005',NULL,NULL,1,'2026-03-25 11:17:37'),(22,6,'Lajpat Nagar','lajpat-nagar','110024',NULL,NULL,1,'2026-03-25 11:17:37'),(23,6,'Saket','saket','110017',NULL,NULL,1,'2026-03-25 11:17:37'),(24,6,'Connaught Place','connaught-place','110001',NULL,NULL,1,'2026-03-25 11:17:37'),(25,6,'Janakpuri','janakpuri','110058',NULL,NULL,1,'2026-03-25 11:17:37'),(26,6,'Pitampura','pitampura','110034',NULL,NULL,1,'2026-03-25 11:17:37');
/*!40000 ALTER TABLE `localities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`,`is_read`),
  KEY `idx_notif_type` (`type`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otp_verifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `purpose` enum('login','register','verify_phone','reset_password') DEFAULT 'login',
  `is_used` tinyint(1) DEFAULT 0,
  `attempts` int(11) DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_otp_phone` (`phone`,`purpose`),
  KEY `idx_otp_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_page_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(5) DEFAULT 'INR',
  `status` enum('created','authorized','captured','refunded','failed') DEFAULT 'created',
  `method` varchar(50) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT 0.00,
  `refund_id` varchar(100) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_pay_booking` (`booking_id`),
  KEY `idx_pay_razorpay` (`razorpay_order_id`),
  KEY `idx_pay_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payouts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `payout_method` varchar(50) DEFAULT 'bank_transfer',
  `bank_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bank_details`)),
  `reference_id` varchar(100) DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `bookings_count` int(11) DEFAULT 0,
  `total_earnings` decimal(10,2) DEFAULT 0.00,
  `total_commission` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_payout_vendor` (`vendor_id`),
  KEY `idx_payout_status` (`status`),
  KEY `idx_payout_period` (`period_start`,`period_end`),
  CONSTRAINT `payouts_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payouts`
--

LOCK TABLES `payouts` WRITE;
/*!40000 ALTER TABLE `payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_review_biz` (`business_id`,`is_approved`),
  KEY `idx_review_user` (`user_id`),
  KEY `idx_review_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seo_meta`
--

DROP TABLE IF EXISTS `seo_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seo_meta` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `page_type` enum('home','city','category','city_category','city_category_locality','business','page') NOT NULL,
  `reference_slug` varchar(500) NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `canonical_url` varchar(500) DEFAULT NULL,
  `h1_override` varchar(255) DEFAULT NULL,
  `additional_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_schema`)),
  `no_index` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_seo_type_slug` (`page_type`,`reference_slug`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seo_meta`
--

LOCK TABLES `seo_meta` WRITE;
/*!40000 ALTER TABLE `seo_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `seo_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_variants`
--

DROP TABLE IF EXISTS `service_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_variants` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(10) unsigned DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_variant_service` (`service_id`),
  CONSTRAINT `service_variants_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_variants`
--

LOCK TABLES `service_variants` WRITE;
/*!40000 ALTER TABLE `service_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `discounted_price` decimal(10,2) DEFAULT NULL,
  `price_unit` enum('fixed','per_hour','per_sqft','per_unit') DEFAULT 'fixed',
  `duration_minutes` int(10) unsigned DEFAULT 60,
  `image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_svc_business` (`business_id`,`is_active`),
  KEY `idx_svc_category` (`category_id`),
  KEY `idx_svc_price` (`base_price`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'site_name','Mechanical Directory','2026-03-25 11:17:14','2026-03-25 11:17:14'),(2,'site_tagline','Find Trusted Mechanical Services Near You','2026-03-25 11:17:14','2026-03-25 11:17:14'),(3,'site_url','http://localhost:3000','2026-03-25 11:17:14','2026-03-25 11:17:14'),(4,'api_url','http://localhost/Mechanical/api','2026-03-25 11:17:14','2026-03-25 11:17:14'),(5,'contact_email','info@mechanicaldirectory.com','2026-03-25 11:17:14','2026-03-25 11:17:14'),(6,'contact_phone','','2026-03-25 11:17:14','2026-03-25 11:17:14'),(7,'default_city','mumbai','2026-03-25 11:17:14','2026-03-25 11:17:14'),(8,'listings_per_page','20','2026-03-25 11:17:14','2026-03-25 11:17:14'),(9,'reviews_per_page','10','2026-03-25 11:17:14','2026-03-25 11:17:14'),(10,'default_commission_rate','15','2026-03-30 11:18:49','2026-03-30 11:18:49'),(11,'min_booking_advance_hours','4','2026-03-30 11:18:49','2026-03-30 11:18:49'),(12,'max_booking_advance_days','30','2026-03-30 11:18:49','2026-03-30 11:18:49'),(13,'cancellation_window_hours','4','2026-03-30 11:18:49','2026-03-30 11:18:49'),(14,'cancellation_fee_percentage','10','2026-03-30 11:18:49','2026-03-30 11:18:49'),(15,'payout_cycle_days','7','2026-03-30 11:18:49','2026-03-30 11:18:49'),(16,'min_payout_amount','500','2026-03-30 11:18:49','2026-03-30 11:18:49'),(17,'razorpay_key_id','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(18,'razorpay_key_secret','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(19,'razorpay_webhook_secret','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(20,'fcm_server_key','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(21,'sms_provider','msg91','2026-03-30 11:18:49','2026-03-30 11:18:49'),(22,'sms_api_key','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(23,'vendor_trial_days','30','2026-03-30 11:18:49','2026-03-30 11:18:49'),(24,'tax_percentage','18','2026-03-30 11:18:49','2026-03-30 11:18:49'),(25,'platform_name','Mechanical Hub','2026-03-30 11:18:49','2026-03-30 11:18:49'),(26,'support_phone','','2026-03-30 11:18:49','2026-03-30 11:18:49'),(27,'support_email','support@mechanicalhub.com','2026-03-30 11:18:49','2026-03-30 11:18:49'),(28,'google_client_id','296437741467-e4o2ml65ii8k0hquer8rrfiq3l0grpup.apps.googleusercontent.com','2026-03-30 15:47:11','2026-03-30 15:52:56'),(29,'revenue_phase','1','2026-03-30 16:21:27','2026-03-30 17:44:06'),(30,'platform_fee_enabled','0','2026-03-30 16:21:27','2026-03-30 17:44:06'),(31,'platform_fee_amount','39','2026-03-30 16:21:27','2026-03-30 16:21:27'),(32,'surge_pricing_enabled','0','2026-03-30 16:21:27','2026-03-30 17:44:06'),(33,'surge_fee_amount','49','2026-03-30 16:21:27','2026-03-30 16:21:27'),(34,'surge_days','sunday','2026-03-30 16:21:27','2026-03-30 16:21:27'),(35,'subscription_required','0','2026-03-30 16:21:27','2026-03-30 17:44:06'),(36,'free_bookings_per_month','999','2026-03-30 16:21:27','2026-03-30 16:21:27'),(37,'commission_enabled','0','2026-03-30 16:21:27','2026-03-30 17:44:06'),(38,'default_commission_rate_override','0','2026-03-30 16:21:27','2026-03-30 16:21:27'),(39,'non_subscriber_commission_rate','20','2026-03-30 16:21:27','2026-03-30 16:21:27'),(40,'subscriber_commission_discount','5','2026-03-30 16:21:27','2026-03-30 16:21:27'),(41,'geo_scope','telangana','2026-03-30 16:53:07','2026-03-30 17:43:13'),(42,'phase1_geo','telangana','2026-03-30 16:53:07','2026-03-30 17:44:06'),(43,'phase2_geo','telangana','2026-03-30 16:53:07','2026-03-30 16:53:07'),(44,'phase3_geo','telangana','2026-03-30 16:53:07','2026-03-30 16:53:07'),(45,'phase4_geo','telangana','2026-03-30 16:53:07','2026-03-30 16:53:07'),(46,'cod_enabled','1','2026-03-30 18:09:55','2026-03-30 18:09:55'),(47,'online_payment_enabled','0','2026-03-30 18:09:55','2026-03-30 18:09:55'),(48,'lead_charge_enabled','0','2026-04-02 10:50:46','2026-04-02 10:50:46'),(49,'lead_charge_amount','10','2026-04-02 10:50:46','2026-04-02 10:50:46');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `states` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_state_slug` (`slug`),
  KEY `idx_state_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'Maharashtra','maharashtra',1,'2026-03-25 11:17:37'),(2,'Delhi','delhi',1,'2026-03-25 11:17:37'),(3,'Karnataka','karnataka',1,'2026-03-25 11:17:37'),(4,'Tamil Nadu','tamil-nadu',1,'2026-03-25 11:17:37'),(5,'Telangana','telangana',1,'2026-03-25 11:17:37'),(6,'Gujarat','gujarat',1,'2026-03-25 11:17:37'),(7,'Rajasthan','rajasthan',1,'2026-03-25 11:17:37'),(8,'Uttar Pradesh','uttar-pradesh',1,'2026-03-25 11:17:37'),(9,'West Bengal','west-bengal',1,'2026-03-25 11:17:37'),(10,'Madhya Pradesh','madhya-pradesh',1,'2026-03-25 11:17:37'),(11,'Kerala','kerala',1,'2026-03-25 11:17:37'),(12,'Punjab','punjab',1,'2026-03-25 11:17:37'),(13,'Haryana','haryana',1,'2026-03-25 11:17:37'),(14,'Bihar','bihar',1,'2026-03-25 11:17:37'),(15,'Odisha','odisha',1,'2026-03-25 11:17:37'),(16,'Andhra Pradesh','andhra-pradesh',1,'2026-03-25 11:17:37'),(17,'Jharkhand','jharkhand',1,'2026-03-25 11:17:37'),(18,'Assam','assam',1,'2026-03-25 11:17:37'),(19,'Chhattisgarh','chhattisgarh',1,'2026-03-25 11:17:37'),(20,'Goa','goa',1,'2026-03-25 11:17:37');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_plans` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `monthly_price` decimal(10,2) NOT NULL,
  `annual_price` decimal(10,2) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `max_services` int(11) DEFAULT 5,
  `max_bookings_per_month` int(11) DEFAULT 50,
  `commission_discount` decimal(5,2) DEFAULT 0.00,
  `is_featured` tinyint(1) DEFAULT 0,
  `priority_in_search` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Basic','basic','Get started with essential features',499.00,4999.00,'[\"Up to 5 services\", \"50 bookings/month\", \"Basic profile\", \"Email support\"]',5,50,0.00,0,0,1,1,'2026-03-30 11:31:13','2026-03-30 11:31:13'),(2,'Pro','pro','Grow your business with advanced tools',999.00,9999.00,'[\"Up to 20 services\", \"200 bookings/month\", \"Featured badge\", \"Priority listing\", \"2% commission discount\", \"Phone support\"]',20,200,2.00,1,5,1,2,'2026-03-30 11:31:13','2026-03-30 11:31:13'),(3,'Premium','premium','Unlimited access for top professionals',1999.00,19999.00,'[\"Unlimited services\", \"Unlimited bookings\", \"Premium badge\", \"Top listing\", \"5% commission discount\", \"Dedicated support\", \"Analytics dashboard\"]',999,9999,5.00,1,10,1,3,'2026-03-30 11:31:13','2026-03-30 11:31:13');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_login_logs`
--

DROP TABLE IF EXISTS `user_login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_login_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `event_type` enum('login','register','otp_login','google_login') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_log_user` (`user_id`),
  KEY `idx_log_event` (`event_type`),
  KEY `idx_log_ip` (`ip_address`),
  KEY `idx_log_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_login_logs`
--

LOCK TABLES `user_login_logs` WRITE;
/*!40000 ALTER TABLE `user_login_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_login_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `fcm_token` varchar(500) DEFAULT NULL,
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `onboarding_completed` tinyint(1) DEFAULT 0,
  `role` enum('user','vendor','business_owner','admin','super_admin') DEFAULT 'user',
  `api_token` varchar(64) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_user_email` (`email`),
  UNIQUE KEY `idx_user_token` (`api_token`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_phone` (`phone`),
  KEY `idx_user_google` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@servicehub.in','9999999999',0,'$2y$12$i0sHs3rVP/Z3SWoUQM33qOoYZNKnGL/vyA3/PfQeloLDHZRPKfqiK',NULL,NULL,NULL,NULL,NULL,1,'super_admin',NULL,NULL,1,NULL,'2026-04-02 11:23:54','2026-04-02 11:23:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_availability`
--

DROP TABLE IF EXISTS `vendor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor_availability` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `day_of_week` tinyint(3) unsigned NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_va_vendor_day` (`vendor_id`,`day_of_week`),
  CONSTRAINT `vendor_availability_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_availability`
--

LOCK TABLES `vendor_availability` WRITE;
/*!40000 ALTER TABLE `vendor_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_bank_details`
--

DROP TABLE IF EXISTS `vendor_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor_bank_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `account_holder_name` varchar(150) NOT NULL,
  `account_number` varchar(30) NOT NULL,
  `ifsc_code` varchar(15) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `branch` varchar(150) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendor_bank_details_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_bank_details`
--

LOCK TABLES `vendor_bank_details` WRITE;
/*!40000 ALTER TABLE `vendor_bank_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_blocked_dates`
--

DROP TABLE IF EXISTS `vendor_blocked_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor_blocked_dates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `blocked_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_vbd_vendor_date` (`vendor_id`,`blocked_date`),
  CONSTRAINT `vendor_blocked_dates_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_blocked_dates`
--

LOCK TABLES `vendor_blocked_dates` WRITE;
/*!40000 ALTER TABLE `vendor_blocked_dates` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_blocked_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_documents`
--

DROP TABLE IF EXISTS `vendor_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor_documents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `document_type` enum('aadhaar','pan','gst','trade_license','other') NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `reviewed_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_vd_vendor` (`vendor_id`),
  KEY `idx_vd_status` (`status`),
  CONSTRAINT `vendor_documents_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_documents`
--

LOCK TABLES `vendor_documents` WRITE;
/*!40000 ALTER TABLE `vendor_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_subscriptions`
--

DROP TABLE IF EXISTS `vendor_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor_subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned NOT NULL,
  `plan_id` int(10) unsigned NOT NULL,
  `razorpay_subscription_id` varchar(100) DEFAULT NULL,
  `status` enum('active','past_due','cancelled','expired','trialing') DEFAULT 'trialing',
  `billing_cycle` enum('monthly','annual') DEFAULT 'monthly',
  `current_period_start` date DEFAULT NULL,
  `current_period_end` date DEFAULT NULL,
  `trial_ends_at` date DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_vs_vendor` (`vendor_id`),
  KEY `idx_vs_status` (`status`),
  KEY `idx_vs_period` (`current_period_end`),
  CONSTRAINT `vendor_subscriptions_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `vendor_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_subscriptions`
--

LOCK TABLES `vendor_subscriptions` WRITE;
/*!40000 ALTER TABLE `vendor_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02 11:41:14
