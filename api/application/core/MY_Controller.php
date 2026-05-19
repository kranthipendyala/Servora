<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Base_Api_Controller extends CI_Controller
{
    protected $current_user = NULL;

    public function __construct()
    {
        parent::__construct();
        $this->_handle_cors();
        $this->_set_json_header();
    }

    /**
     * Handle CORS headers for cross-origin requests.
     * In production, replace '*' with your actual frontend domain.
     */
    private function _handle_cors()
    {
        $allowed_origins = array(
            'https://servora.vercel.app',
            'http://localhost:3000',
        );

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 3600');

        if ($this->input->method(TRUE) === 'OPTIONS') {
            header('HTTP/1.1 200 OK');
            exit;
        }
    }

    /**
     * Set Content-Type to JSON for all responses.
     */
    private function _set_json_header()
    {
        header('Content-Type: application/json; charset=UTF-8');
    }

    /**
     * Send a successful JSON response.
     *
     * @param mixed $data        Response data
     * @param int   $status_code HTTP status code
     * @param string $message    Optional message
     */
    protected function respond($data = NULL, $status_code = 200, $message = 'Success')
    {
        http_response_code($status_code);
        $response = array(
            'status'  => ($status_code >= 200 && $status_code < 300),
            'message' => $message,
            'data'    => $data
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send an error JSON response.
     *
     * @param string $message    Error message
     * @param int    $code       HTTP status code
     * @param mixed  $errors     Additional error details
     */
    protected function respond_error($message = 'An error occurred', $code = 400, $errors = NULL)
    {
        http_response_code($code);
        $response = array(
            'status'  => FALSE,
            'message' => $message,
            'data'    => NULL
        );
        if ($errors !== NULL) {
            $response['errors'] = $errors;
        }
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Authenticate the current request via Bearer token.
     * Sets $this->current_user if valid token found.
     * Does NOT block request if no token — use _require_auth() for that.
     */
    protected function _authenticate()
    {
        $token = $this->_get_bearer_token();
        if (empty($token)) {
            return FALSE;
        }

        // Try JWT first (new path). JWTs have a recognisable shape (eyXXX.YYY.ZZZ).
        // Inline the shape check so we don't load the JWT library on every legacy-token request.
        if (substr_count($token, '.') === 2 && substr($token, 0, 2) === 'ey') {
            $this->load->library('Jwt_lib', NULL, 'jwt');
            $payload = $this->jwt->decode($token);
            if ($payload && ! empty($payload['sub'])) {
                $this->load->model('User_model');
                $user = $this->User_model->get_by_id((int) $payload['sub']);
                if ($user) {
                    $this->current_user = $user;
                    return TRUE;
                }
            }
            // JWT looked valid by shape but didn't verify or user not found —
            // fall through to opaque-token lookup in case the client is
            // mid-migration and sent something else.
        }

        // Legacy opaque-token path (users.token + users.token_expires_at).
        $this->load->model('User_model');
        $user = $this->User_model->get_by_token($token);
        if ($user && strtotime($user->token_expires_at) > time()) {
            $this->current_user = $user;
            return TRUE;
        }

        return FALSE;
    }

    /**
     * Issue a JWT for a user. Used by Auth.php to dual-emit (legacy opaque token
     * AND a JWT) so clients can migrate at their own pace. Returns the encoded
     * JWT string, or NULL if the JWT library fails to load (never throws).
     */
    protected function _issue_jwt($user_id, $role)
    {
        if (empty($user_id)) return NULL;
        try {
            $this->load->library('Jwt_lib', NULL, 'jwt');
            return $this->jwt->issue((int) $user_id, $role);
        } catch (\Throwable $e) {
            log_message('error', 'JWT issuance failed for user ' . $user_id . ': ' . $e->getMessage());
            return NULL;
        }
    }

    /**
     * Require authentication. Sends 401 if not authenticated.
     */
    protected function _require_auth()
    {
        if ( ! $this->_authenticate()) {
            $this->respond_error('Authentication required', 401);
        }
    }

    /**
     * Require a specific user role. Sends 403 if role does not match.
     *
     * @param string|array $role Single role string or array of allowed roles
     */
    protected function _require_role($role)
    {
        $this->_require_auth();

        $roles = is_array($role) ? $role : array($role);

        if ( ! in_array($this->current_user->role, $roles)) {
            $this->respond_error('Insufficient permissions', 403);
        }
    }

    /**
     * Extract Bearer token from Authorization header.
     *
     * @return string|null
     */
    private function _get_bearer_token()
    {
        $header = NULL;

        // Try apache_request_headers first
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $headers = array_change_key_case($headers, CASE_LOWER);
            if (isset($headers['authorization'])) {
                $header = $headers['authorization'];
            }
        }

        // Try $_SERVER variants
        if (empty($header) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (empty($header) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (empty($header)) {
            $header = $this->input->server('HTTP_AUTHORIZATION');
        }

        if (empty($header)) {
            $header = $this->input->server('REDIRECT_HTTP_AUTHORIZATION');
        }

        // Try getallheaders as last resort
        if (empty($header) && function_exists('getallheaders')) {
            $all = getallheaders();
            $all = array_change_key_case($all, CASE_LOWER);
            if (isset($all['authorization'])) {
                $header = $all['authorization'];
            }
        }

        if ( ! empty($header) && preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            return $matches[1];
        }

        // Fallback: check X-Auth-Token header (bypasses servers that strip Authorization)
        $alt_token = isset($_SERVER['HTTP_X_AUTH_TOKEN'])
            ? $_SERVER['HTTP_X_AUTH_TOKEN']
            : $this->input->server('HTTP_X_AUTH_TOKEN');

        if ( ! empty($alt_token)) {
            return $alt_token;
        }

        return NULL;
    }

    /**
     * Get JSON body from POST/PUT requests.
     *
     * @return array
     */
    protected function _get_json_body()
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, TRUE);
        return is_array($data) ? $data : array();
    }

    /**
     * Validate required fields exist in data array.
     *
     * @param array $data     Input data
     * @param array $required List of required field names
     * @return array          List of missing field names (empty if all present)
     */
    protected function _validate_required($data, $required)
    {
        $missing = array();
        foreach ($required as $field) {
            if ( ! isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    /**
     * Get pagination parameters from query string.
     *
     * @return array ['page' => int, 'per_page' => int, 'offset' => int]
     */
    protected function _get_pagination()
    {
        $per_page = (int) $this->input->get('per_page');
        $page = (int) $this->input->get('page');

        $max_per_page = 100;
        $default_per_page = $this->config->item('pagination_per_page') ?: 20;

        if ($per_page < 1 || $per_page > $max_per_page) {
            $per_page = $default_per_page;
        }
        if ($page < 1) {
            $page = 1;
        }

        return array(
            'page'     => $page,
            'per_page' => $per_page,
            'offset'   => ($page - 1) * $per_page
        );
    }
}
