# Servora — local infrastructure

Docker Compose stack for local development. Run alongside (or instead of) XAMPP MySQL.

## Services

| Service        | URL                       | Credentials                       |
| -------------- | ------------------------- | --------------------------------- |
| MySQL 8        | `localhost:3306`          | user `servora` / pass `servora`   |
| phpMyAdmin     | http://localhost:8081     | user `root` / pass `rootpass`     |
| Elasticsearch  | http://localhost:9200     | (security disabled for local)     |
| Kibana         | http://localhost:5601     | —                                 |

## Start

```powershell
docker compose up -d
```

## Apply Elasticsearch mappings

After ES is healthy:

```powershell
curl -X PUT http://localhost:9200/servora_businesses -H "Content-Type: application/json" -d "@elasticsearch/mappings/businesses.json"
```

Or use the API's admin endpoint, which is the source of truth for the mapping (defined in `api/application/libraries/Business_indexer.php`):

```powershell
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" ^
  -d "{\"drop\": true}" ^
  http://localhost/Servora/api/index.php/api/admin/elastic/reindex
```

## Stop / wipe

```powershell
docker compose down            # stop, keep data
docker compose down -v         # stop + delete volumes (full reset)
```

## Already running MySQL via XAMPP?

Comment out the `mysql:` and `phpmyadmin:` services in `docker-compose.yml`, and edit `api/application/config/database.php` to point at your XAMPP MySQL credentials (defaults: host `localhost`, user `root`, password `''`).
