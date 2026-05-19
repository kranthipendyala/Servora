<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| JWT settings
|--------------------------------------------------------------------------
| Override via env vars: JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_TTL.
|
| SECURITY: change JWT_SECRET in production. The dev fallback below is
| only acceptable for local development.
*/

$config['jwt']['secret']   = getenv('JWT_SECRET')   ?: 'dev-only-change-me-in-production-' . md5(__FILE__);
$config['jwt']['issuer']   = getenv('JWT_ISSUER')   ?: 'servora';
$config['jwt']['audience'] = getenv('JWT_AUDIENCE') ?: 'servora-clients';

// Access-token lifetime in seconds. 30 days matches the existing opaque-token TTL.
$config['jwt']['ttl'] = (int) (getenv('JWT_TTL') ?: 60 * 60 * 24 * 30);

// HS256 is fine for a single-issuer/single-verifier app. Move to RS256 (asymmetric)
// if you ever federate verification to other services.
$config['jwt']['algorithm'] = 'HS256';
