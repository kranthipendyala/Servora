<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// PRODUCTION Configuration
// Copy to: /home/USERNAME/public_html/servora/api/application/config/config.php
// Only showing settings that differ from default CI3 config

$config['base_url'] = 'https://obesityworldconference.com/servora/api/';
$config['index_page'] = '';
$config['uri_protocol'] = 'REQUEST_URI';
$config['log_threshold'] = 1;  // 0=off, 1=errors only
$config['encryption_key'] = bin2hex(random_bytes(16)); // GENERATE A REAL KEY AND HARDCODE IT

// CORS - update for production
$config['cors_allowed_origins'] = 'https://obesityworldconference.com';

// API token expiry (30 days)
$config['api_token_expiry'] = 2592000;

// Pagination
$config['pagination_per_page'] = 20;
