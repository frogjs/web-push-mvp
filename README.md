# Web Push MVP

Minimal NestJS + MongoDB + BullMQ MVP for web push notifications.

## Setup

1. Install dependencies:

npm install

2. Generate VAPID keys:

npm run generate:vapid

Copy the keys into `.env` (start from `.env.example`).

3. Run the stack:

docker compose up --build

The API runs at `http://localhost:3000` with Swagger at `/docs`.

## HTTPS for Push

Push notifications require HTTPS, except for `localhost`. To test on a mobile device, use ngrok:

ngrok http 3000

Set `BASE_URL` in `.env` to the ngrok URL and open it in the browser.

## Usage

1. Open `http://localhost:3000` and click Subscribe.
2. Create a campaign:

curl -X POST http://localhost:3000/campaigns \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"Web push test","url":"https://example.com"}'

3. Receive the notification and click or close it. Client events are stored via `/client-events`.

## Postman examples

Create a campaign:

- Method: `POST`
- URL: `http://localhost:3000/campaigns`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

json
{
  "title": "Launch",
  "body": "Click to view details",
  "icon": "https://placehold.co/128x128",
  "url": "https://example.com/launch",
  "data": {
    "source": "mvp-demo"
  }
}

Check campaign status:

- Method: `GET`
- URL: `http://localhost:3000/campaigns/<CAMPAIGN_ID>`


## Typical push payload

This is the payload that the API sends to the service worker per subscription (the worker reads `url` and `campaignId`).
The worker posts `campaignId` back on CLICK/CLOSE events and opens `url` on click.

json
{
  "title": "Launch",
  "body": "Click to view details",
  "icon": "https://placehold.co/128x128",
  "url": "https://example.com/launch",
  "data": {
    "source": "mvp-demo"
  },
  "campaignId": "65f0c4c4f4b1a2b3c4d5e6f7"
}

## Endpoints

- `GET /vapid/public-key`
- `POST /subscriptions`
- `GET /subscriptions`
- `POST /campaigns`
- `GET /campaigns/:id`
- `POST /client-events`

## Notes

- Ensure `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are set.
- BullMQ worker runs inside the API process.
