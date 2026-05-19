# Elasticsearch indices

Servora uses Elasticsearch 8.x to serve search and filtered listings. **MySQL is canonical**; ES is a derived index.

Connection settings: [api/application/config/elasticsearch.php](../api/application/config/elasticsearch.php). Env overrides: `ES_HOSTS`, `ES_API_KEY`, `ES_USER`, `ES_PASS`, `ES_CA_BUNDLE`, `ES_INDEX_PREFIX`.

## Indices

| Index name             | Source table     | Defined in                                                                                  |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `servora_businesses`   | `businesses` (+ joined categories, services, service areas) | [api/application/libraries/Business_indexer.php](../api/application/libraries/Business_indexer.php) `mapping()` |

The actual prefix comes from `config['elasticsearch']['index_prefix']` (default `servora`). A standalone JSON copy of the mapping for `curl -X PUT` setups lives at [infra/elasticsearch/mappings/businesses.json](../infra/elasticsearch/mappings/businesses.json).

## `servora_businesses`

### Doc shape (one per business)

```jsonc
{
  "id": 42,
  "name": "Rajesh Plumbing Services",
  "slug": "rajesh-plumbing-services",
  "phone": "9999999999",
  "description": "...",
  "short_description": "...",
  "address": "Plot 14, Banjara Hills...",
  "pin_code": "500034",
  "logo": "/uploads/biz/42.jpg",

  "status": "approved",
  "is_active": true,
  "is_verified": true,
  "is_featured": false,
  "avg_rating": 4.6,
  "total_reviews": 28,

  "city_id": 5,
  "city_name": "Hyderabad",
  "city_slug": "hyderabad",
  "state_id": 1,
  "state_slug": "telangana",
  "locality_id": 12,
  "locality_name": "Banjara Hills",
  "locality_slug": "banjara-hills",
  "location": { "lat": 17.41, "lon": 78.45 },

  "category_names":  ["Plumbing", "Bathroom Fittings"],
  "category_slugs":  ["plumbing", "bathroom-fittings"],
  "service_names":   ["Leak repair", "Tap installation", "Geyser servicing"],
  "service_area_city_slugs": ["hyderabad", "secunderabad"],

  "created_at": "2025-09-12T10:01:00+05:30",
  "updated_at": "2026-05-16T11:42:00+05:30"
}
```

### Mapping highlights

- `name` uses an **edge-ngram analyzer** at index time (`min_gram=2, max_gram=20`) and a standard analyzer at search time, so typing "ele" matches "electrician".
- `name.keyword`, `city_name.keyword`, `category_names.keyword` are kept as `keyword` sub-fields for exact filters and sort.
- `location` is a `geo_point` — ready for geo-distance queries when we wire that up.
- `category_slugs`, `service_area_city_slugs` are `keyword` arrays — used directly as filter terms.

### Query patterns (built by `Business_indexer`)

**Free-text search** (`text_search`):

```jsonc
{
  "query": {
    "bool": {
      "filter": [/* base filters: status, is_active, geo_scope, city, category */],
      "must": [{
        "multi_match": {
          "query": "<user query>",
          "type": "best_fields",
          "fields": [
            "name^4",
            "category_names^3",
            "service_names^2",
            "short_description^1.5",
            "description", "address", "city_name", "locality_name"
          ],
          "fuzziness": "AUTO"
        }
      }]
    }
  },
  "sort": ["_score", { "is_verified": "desc" }, { "avg_rating": "desc" }]
}
```

**Filtered listing** (`list_search`):

```jsonc
{
  "query": {
    "bool": {
      "filter": [/* base filters */],
      "must": [{ "match_all": {} }]
    }
  },
  "sort": [/* depends on ?sort= : rating | name | newest | reviews | default */]
}
```

### Base filters

Applied by `Business_indexer::_base_filters($filters)`:

- `status=approved` and `is_active=true` (unless caller passes `status='all'` — admin only)
- Geo scope from `settings.geo_scope` — if `'telangana'`, adds `state_slug=telangana`
- `city_slug`: matches **either** the home city OR the business's `service_area_city_slugs`
- `category_slug`: term match on `category_slugs`
- `locality_slug`: term match
- `is_verified=true` when `?verified=1`
- `min_rating`: range filter on `avg_rating`

## Lifecycle

1. **Create the index** — `POST /api/admin/elastic/setup` (body: `{"drop": true}` to recreate)
2. **Bulk seed** — `POST /api/admin/elastic/reindex` (body: `{"drop": true, "batch_size": 200}`)
3. **Incremental sync** — every business write reindexes the affected doc:
   - `Business_model::create / update / update_rating / _sync_categories / sync_service_areas`
   - `Service_model::create / update / delete` (services change `service_names`)
   - Admin direct-DB toggles (`approve_business`, `verify_business`, `feature_business`, `delete_business`)
4. **Per-doc reindex** — `POST /api/admin/elastic/reindex/{id}`
5. **Health check** — `GET /api/elastic/ping`

Incremental syncs are best-effort: failures are logged to `api/application/logs/`, never thrown back at the caller. The recovery valve is the bulk reindex above.

## Read-side fallback

When ES is unreachable or the index doesn't exist, [Search.php](../api/application/controllers/api/Search.php) and [Businesses.php](../api/application/controllers/api/Businesses.php) silently fall back to `Business_model::search()` / `get_listing()` (MySQL `LIKE` + filters). The JSON response shape is identical except for the `engine` field which flips from `"elasticsearch"` to `"mysql"`.

## Future indices

Not built yet, but the same `Business_indexer`-style pattern would apply:

- `servora_services` — for cross-business service search ("AC repair near me" → list services across vendors)
- `servora_localities` — autocomplete for the location picker (currently MySQL)
