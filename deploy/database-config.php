<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// PRODUCTION Database Configuration
// Update username and password after creating DB user in phpMyAdmin

$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array(
    'dsn'          => '',
    'hostname'     => 'localhost',
    'username'     => 'servora_user',           // CHANGE THIS
    'password'     => 'CHANGE_THIS_PASSWORD',   // CHANGE THIS
    'database'     => 'servora_directory',
    'dbdriver'     => 'mysqli',
    'dbprefix'     => '',
    'pconnect'     => FALSE,
    'db_debug'     => FALSE,    // FALSE in production
    'cache_on'     => FALSE,
    'cachedir'     => '',
    'char_set'     => 'utf8mb4',
    'dbcollat'     => 'utf8mb4_unicode_ci',
    'swap_pre'     => '',
    'encrypt'      => FALSE,
    'compress'     => FALSE,
    'stricton'     => FALSE,
    'failover'     => array(),
    'save_queries' => FALSE     // FALSE in production
);
