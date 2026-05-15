<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Elastic extends Base_Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->library('Elasticsearch_lib', NULL, 'es');
    }

    /**
     * GET /api/elastic/ping
     * Reports cluster connectivity + version. Public so dev tooling can probe.
     */
    public function ping()
    {
        $ok   = $this->es->ping();
        $info = $ok ? $this->es->info() : NULL;
        $cfg  = $this->es->config();

        $payload = array(
            'connected'    => $ok,
            'hosts'        => isset($cfg['hosts']) ? $cfg['hosts'] : array(),
            'index_prefix' => isset($cfg['index_prefix']) ? $cfg['index_prefix'] : NULL,
        );

        if ($ok && $info) {
            $payload['cluster_name'] = isset($info['cluster_name']) ? $info['cluster_name'] : NULL;
            $payload['version']      = isset($info['version']['number']) ? $info['version']['number'] : NULL;
        } else {
            $payload['error'] = $this->es->last_error() ?: 'Unable to reach Elasticsearch';
        }

        $this->respond($payload, $ok ? 200 : 503, $ok ? 'Elasticsearch connected' : 'Elasticsearch unreachable');
    }

    /**
     * POST /api/admin/elastic/setup
     * Body: { "drop": true|false } — if drop=true, deletes and recreates the index.
     */
    public function setup()
    {
        $this->_require_role('admin');
        $this->load->library('Business_indexer', NULL, 'indexer');

        $body = $this->_get_json_body();
        $drop = ! empty($body['drop']);

        $res = $this->indexer->setup_index($drop);
        if ( ! $res['ok']) {
            $this->respond_error('Index setup failed: ' . $res['error'], 500);
        }

        $this->respond(array(
            'index'   => $this->indexer->index_name(),
            'dropped' => $drop,
        ), 200, 'Index ready');
    }

    /**
     * POST /api/admin/elastic/reindex
     * Body: { "drop": true|false, "batch_size": 200 }
     */
    public function reindex()
    {
        $this->_require_role('admin');
        $this->load->library('Business_indexer', NULL, 'indexer');

        $body = $this->_get_json_body();
        $drop = ! empty($body['drop']);
        $batch_size = isset($body['batch_size']) ? max(50, min(1000, (int) $body['batch_size'])) : 200;

        $setup = $this->indexer->setup_index($drop);
        if ( ! $setup['ok']) {
            $this->respond_error('Index setup failed: ' . $setup['error'], 500);
        }

        @set_time_limit(0);
        $result = $this->indexer->reindex_all($batch_size);
        $result['index'] = $this->indexer->index_name();
        $this->respond($result, 200, 'Reindex complete');
    }

    /**
     * POST /api/admin/elastic/reindex/{id}
     */
    public function reindex_one($id)
    {
        $this->_require_role('admin');
        $this->load->library('Business_indexer', NULL, 'indexer');

        $ok = $this->indexer->index_one((int) $id);
        if ( ! $ok) {
            $this->respond_error('Index failed: ' . ($this->es->last_error() ?: 'business not found'), 500);
        }
        $this->respond(array('id' => (int) $id), 200, 'Indexed');
    }
}
