# Combinations API

Node.js + MySQL service that generates all valid combinations of items and stores them in the database.

Each number in the input is the count of items of one type. Types get letter prefixes in order, so `[1, 2, 1]` means `A1`, `B1`, `B2`, `C1`. Items with the same prefix never end up in the same combination.

Stack: TypeScript, Express 5, mysql2 (raw SQL, no ORM), zod for validation.

## Running

### Docker

```bash
cp .env.example .env
npm run docker:up
```

This starts MySQL, runs the migrations and then starts the API on `PORT` (3000 by default).

### Locally

```bash
cp .env.example .env
npm install
npm run db:up      # MySQL only, in Docker
npm run migrate
npm run dev
```

For a production build: `npm run build && npm start`.

### Environment

| Variable | Description |
|---|---|
| `PORT` | API port |
| `DB_HOST`, `DB_PORT` | MySQL address |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | App user and database |
| `DB_ROOT_PASSWORD` | MySQL root password, used only by docker-compose |

## API

### `POST /generate`

```json
{
  "items": [1, 2, 1],
  "length": 2
}
```

Response:

```json
{
  "id": 1,
  "combination": [
    ["A1", "B1"], ["A1", "B2"], ["A1", "C1"],
    ["B1", "C1"], ["B2", "C1"]
  ]
}
```

| Status | When |
|---|---|
| `201` | New result was generated and saved |
| `200` | The same input was requested before, the saved result is returned |
| `400` | Invalid JSON or the body did not pass validation |
| `500` | Unexpected server error |

Validation rules:

- `items`: 1 to 26 positive integers (one per letter A-Z), each up to 100
- `length`: positive integer, not greater than the number of types
- the total number of combinations must not exceed 100 000

The total is calculated before generating anything, so heavy requests are rejected early.

```bash
curl -X POST localhost:3000/generate \
  -H 'Content-Type: application/json' \
  -d '{"items": [1, 2, 1], "length": 2}'
```

## Database

| Table | Content |
|---|---|
| `items` | Unique items (`A1`, `B1`, ...), shared between all requests |
| `combinations` | One row per generated set, with its `id` and a SHA-256 hash of the input |
| `combination_items` | Items of each combination: `combination_id`, `group_index` (number of the combination inside the set), `position`, `item_id` |
| `responses` | JSON of every response sent to the client |
| `migrations` | Applied migrations |

Migrations are plain SQL files in `src/db/migrations`, applied in name order by `npm run migrate`.

## Design notes

- **`id` belongs to the whole set, not to a single combination.** That matches the response format in the task. A single combination is identified by `(combination_id, group_index)`, and combinations are stored normalized in `combination_items` instead of being duplicated as strings.
- **Repeated requests are not regenerated.** The input is hashed (`items` + `length`), and if the hash already exists the saved result is returned with the same `id`. The unique index on the hash keeps this correct when identical requests arrive at the same time.
- **Every response is saved.** `responses` stores a full copy of the JSON for every request, including repeated ones. It's what the task asks for, but for big sets it grows quickly (about 3 MB per request for 100 000 combinations).
- **Transactions.** `combinations`, `combination_items` and `responses` are written in one transaction. `items` are upserted (`INSERT IGNORE`) before it, since they are shared and don't need to be rolled back. The response row for a repeated request is a single insert, so it runs without an explicit transaction.
- **Deadlocks.** Concurrent requests can deadlock in MySQL; the operation is retried up to 3 times.
- **Performance.** Combinations are generated with backtracking that skips branches which can't reach the required length. `combination_items` are inserted in batches of 5000 rows. 100 000 combinations take a few seconds to save.

## Project structure

```
src/
  routes/         Express routers
  controllers/    HTTP layer
  services/       Generation logic and transactions
  repositories/   SQL queries
  dto/            Request validation
  entities/       Types
  middlewares/    Validation and error handling
  db/             Pool, migration runner, SQL migrations
  config/         Environment parsing
```
