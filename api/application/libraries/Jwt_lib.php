<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Issue and verify Servora JWTs.
 *
 * Token layout:
 *   iss   "servora"           — issuer
 *   aud   "servora-clients"   — audience
 *   sub   <user_id>           — the user this token authenticates
 *   role  <role>              — denormalised user role for fast checks
 *   iat   <unix ts>           — issued-at
 *   exp   <unix ts>           — expiry (default +30 days)
 *
 * Co-exists with the legacy opaque-token mechanism on users.token /
 * users.token_expires_at. Base_Api_Controller::_authenticate() tries
 * JWT first, then falls back to opaque tokens.
 */
class Jwt_lib
{
    /** @var array */
    private $cfg = array();

    public function __construct()
    {
        $CI =& get_instance();
        $CI->config->load('jwt', TRUE);
        $this->cfg = $CI->config->item('jwt', 'jwt') ?: array();
    }

    /**
     * Issue a JWT for the given user.
     *
     * @param int    $user_id
     * @param string $role     "customer" | "vendor" | "admin" | "super_admin"
     * @param int|null $ttl    override the default TTL (seconds) for this token
     * @return string          encoded JWT
     */
    public function issue($user_id, $role, $ttl = NULL)
    {
        $now = time();
        $exp = $now + ($ttl ?: (int) $this->cfg['ttl']);

        $payload = array(
            'iss'  => $this->cfg['issuer'],
            'aud'  => $this->cfg['audience'],
            'sub'  => (int) $user_id,
            'role' => $role,
            'iat'  => $now,
            'exp'  => $exp,
        );

        return JWT::encode($payload, $this->cfg['secret'], $this->cfg['algorithm']);
    }

    /**
     * Decode + verify a JWT. Returns the payload array on success, NULL on any failure
     * (expired, bad signature, malformed, wrong issuer/audience).
     *
     * @param string $token
     * @return array|null
     */
    public function decode($token)
    {
        if (empty($token)) return NULL;

        try {
            $decoded = JWT::decode($token, new Key($this->cfg['secret'], $this->cfg['algorithm']));
            $payload = (array) $decoded;

            // Validate issuer + audience (firebase/php-jwt v7 doesn't enforce these by default)
            if (isset($payload['iss']) && $payload['iss'] !== $this->cfg['issuer'])   return NULL;
            if (isset($payload['aud']) && $payload['aud'] !== $this->cfg['audience']) return NULL;

            return $payload;
        } catch (\Throwable $e) {
            return NULL;
        }
    }

    /**
     * Quick heuristic — does this string LOOK like a JWT? Three base64url segments
     * separated by dots. Used by the base controller to choose verification path.
     */
    public static function looks_like_jwt($token)
    {
        return is_string($token) && substr_count($token, '.') === 2 && strpos($token, 'ey') === 0;
    }
}
