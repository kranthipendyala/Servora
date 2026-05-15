<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use Elastic\Elasticsearch\ClientBuilder;
use Elastic\Elasticsearch\Client;

class Elasticsearch_lib
{
    /** @var Client|null */
    private $client = NULL;

    /** @var array */
    private $cfg = array();

    /** @var string|null */
    private $last_error = NULL;

    public function __construct()
    {
        $CI =& get_instance();
        $CI->config->load('elasticsearch', TRUE);
        $this->cfg = $CI->config->item('elasticsearch', 'elasticsearch') ?: array();
    }

    /**
     * Lazily build the ES client. Returns NULL and sets last_error on failure.
     *
     * @return Client|null
     */
    public function client()
    {
        if ($this->client !== NULL) {
            return $this->client;
        }

        try {
            $builder = ClientBuilder::create()->setHosts($this->cfg['hosts']);

            if ( ! empty($this->cfg['api_key'])) {
                $builder->setApiKey($this->cfg['api_key']);
            } elseif ( ! empty($this->cfg['username'])) {
                $builder->setBasicAuthentication($this->cfg['username'], $this->cfg['password'] ?: '');
            }

            if ( ! empty($this->cfg['ca_bundle'])) {
                $builder->setCABundle($this->cfg['ca_bundle']);
            }

            $this->client = $builder->build();
            return $this->client;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return NULL;
        }
    }

    public function ping()
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            return (bool) $c->ping()->asBool();
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function info()
    {
        $c = $this->client();
        if ( ! $c) return NULL;
        try {
            return $c->info()->asArray();
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return NULL;
        }
    }

    public function index_name($suffix)
    {
        $prefix = isset($this->cfg['index_prefix']) ? $this->cfg['index_prefix'] : 'servora';
        return $prefix . '_' . $suffix;
    }

    public function index_exists($index)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            return $c->indices()->exists(array('index' => $index))->getStatusCode() === 200;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function create_index($index, $body)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            $c->indices()->create(array(
                'index' => $index,
                'body'  => $body,
            ));
            return TRUE;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function delete_index($index)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            $c->indices()->delete(array('index' => $index));
            return TRUE;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function index_doc($index, $id, array $body)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            $c->index(array(
                'index' => $index,
                'id'    => (string) $id,
                'body'  => $body,
            ));
            return TRUE;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function delete_doc($index, $id)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            $c->delete(array(
                'index' => $index,
                'id'    => (string) $id,
            ));
            return TRUE;
        } catch (\Throwable $e) {
            // 404 is fine — doc already absent
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    /**
     * Bulk index documents. $docs is an array of ['id' => mixed, 'body' => array].
     * Returns ['indexed' => int, 'errors' => array].
     */
    public function bulk_index($index, array $docs)
    {
        $c = $this->client();
        if ( ! $c) return array('indexed' => 0, 'errors' => array('client unavailable: ' . $this->last_error));

        if (empty($docs)) return array('indexed' => 0, 'errors' => array());

        $params = array('body' => array());
        foreach ($docs as $d) {
            $params['body'][] = array('index' => array('_index' => $index, '_id' => (string) $d['id']));
            $params['body'][] = $d['body'];
        }

        try {
            $res = $c->bulk($params)->asArray();
            $errors = array();
            $indexed = 0;
            if ( ! empty($res['items'])) {
                foreach ($res['items'] as $item) {
                    if (isset($item['index']['error'])) {
                        $errors[] = $item['index']['error'];
                    } else {
                        $indexed++;
                    }
                }
            }
            return array('indexed' => $indexed, 'errors' => $errors);
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return array('indexed' => 0, 'errors' => array($e->getMessage()));
        }
    }

    /**
     * Run a search query. $body is the full ES search request body.
     * Returns the response array, or NULL on failure.
     */
    public function search($index, array $body)
    {
        $c = $this->client();
        if ( ! $c) return NULL;
        try {
            return $c->search(array(
                'index' => $index,
                'body'  => $body,
            ))->asArray();
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return NULL;
        }
    }

    public function refresh($index)
    {
        $c = $this->client();
        if ( ! $c) return FALSE;
        try {
            $c->indices()->refresh(array('index' => $index));
            return TRUE;
        } catch (\Throwable $e) {
            $this->last_error = $e->getMessage();
            return FALSE;
        }
    }

    public function soft_fail()
    {
        return ! empty($this->cfg['soft_fail']);
    }

    public function last_error()
    {
        return $this->last_error;
    }

    public function config()
    {
        return $this->cfg;
    }
}
