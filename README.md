# prajahita-sync

A server-side webhook receiver that mirrors Shop Supabase records into the Employee/Management Supabase project.

## Data flow

Shop Supabase database webhooks send INSERT, UPDATE, and DELETE payloads to this service. Supported source tables are `customers`, `orders`, `order_items`, and `payments`. An order INSERT also creates one corresponding notification in the destination `notifications` table.

## Requirements and setup

- Node.js 22+
- Shop Supabase database webhooks configured for the supported tables
- Employee/Management Supabase destination tables
- A private shared webhook secret

```bash
npm install
cp .env.example .env
npm start
```

Set these server-only environment variables:

- `EMP_SUPABASE_URL` — destination Supabase URL.
- `EMP_SUPABASE_SERVICE_ROLE_KEY` — destination service-role key; never expose it to a browser.
- `WEBHOOK_SECRET` — long random secret also configured on each Shop database webhook.
- `PORT` — optional HTTP port (default 3000).

A Shop service-role key is not required: the webhook payload contains the source row. Do not commit `.env` or any real secret.

## Endpoints

- `GET /health` — liveness check; works without database credentials.
- `GET /ready` — verifies destination database connectivity using the `customers` table.
- `POST /webhook` — authenticated webhook receiver.

Configure the Shop webhook URL as `https://<your-service-domain>/webhook` and send the `x-webhook-secret` header with the exact `WEBHOOK_SECRET` value.

## Reliability and security

- Upserts use the source primary key with explicit `onConflict: 'id'`.
- Synced rows are tagged `source_db: 'shop'` and receive a `sync_updated_at` timestamp.
- Order notifications use a deterministic UUID, so webhook retries update the same notification rather than duplicating it.
- Deletes use the actual source primary key (`id`); deleting an order also removes its corresponding notification.
- Webhook secret comparison uses `crypto.timingSafeEqual`.
- Unsupported tables are acknowledged and ignored; malformed supported events are rejected.
- Database errors are logged server-side; callers receive a generic retryable 502 response.
- Health and readiness are separate, so a temporary database outage does not make the process appear dead.

## Tests

Run `npm test`. Tests use Node's built-in test runner and do not require a live Supabase project.
