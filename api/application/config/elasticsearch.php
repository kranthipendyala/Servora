<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Elasticsearch
|--------------------------------------------------------------------------
| Override via env vars: ES_HOSTS, ES_API_KEY, ES_USER, ES_PASS, ES_CA_BUNDLE
*/

$es_hosts = getenv('ES_HOSTS');
$config['elasticsearch']['hosts'] = $es_hosts
    ? array_map('trim', explode(',', $es_hosts))
    : array('http://localhost:9200');

$config['elasticsearch']['api_key']    = getenv('ES_API_KEY') ?: NULL;
$config['elasticsearch']['username']   = getenv('ES_USER')    ?: NULL;
$config['elasticsearch']['password']   = getenv('ES_PASS')    ?: NULL;
$config['elasticsearch']['ca_bundle']  = getenv('ES_CA_BUNDLE') ?: NULL;

// Index name prefix — final index for businesses is "{prefix}_businesses"
$config['elasticsearch']['index_prefix'] = getenv('ES_INDEX_PREFIX') ?: 'servora';

// Soft-fail: if ES is unreachable, search endpoints fall back to MySQL
$config['elasticsearch']['soft_fail'] = TRUE;
