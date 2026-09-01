# prajahita-sync

Production-ready Node.js service that mirrors Shop Supabase webhook events into an Employee Supabase project.

## Requirements

- Node.js 22+
- A Shop Supabase project with database webhooks configured
- An Employee Supabase project with the synced tables

## Setup

```bash
npm install
copy .env.example .env
```

Fill `.env` with both Supabase URLs, service-role keys, and a shared `WEBHOOK_SECRET`. Service-role keys are server-only secrets and must never be exposed to a browser.

Start the service:

```bash
npm start
```

The service listens on `PORT` (default `3000`). Railway can run it without modification using the `start` script in `package.json`.

## Endpoints

- `GET /health` returns the service health status.
- `POST /webhook` accepts `INSERT`, `UPDATE`, and `DELETE` Supabase webhook events.

Configure the Shop database webhook URL as:

```text
https://<your-railway-domain>/webhook
```

Send the shared secret in the `x-webhook-secret` header. Events for tables other than `customers`, `orders`, `order_items`, and `payments` are acknowledged and ignored.

## Webhook payload

```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {},
  "old_record": {}
}
```

`old_record` is used for `DELETE` events. Order inserts also create a corresponding row in `notifications`.

## Security and operations

- Supabase service-role keys are loaded only on the server.
- Webhooks require `x-webhook-secret` to match `WEBHOOK_SECRET`.
- Helmet, CORS, JSON parsing, and request logging are enabled.
- Sync failures return `{ "success": false, "error": "..." }` and are logged without crashing the process.
- `SIGTERM` and `SIGINT` are handled for graceful deployment shutdowns.
