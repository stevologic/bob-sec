# bob-dashboard-ui

Dashboard V2A shell for `bob-sec`.

## Scope

This app stays lightweight and read-only, but now carries the V2 execution shape:

- summary strip
- OpenClaw telemetry source card
- GitHub issues source card
- stage-lane board
- worker table
- selected-worker detail panel
- client-side-safe fallback mode

## V2 config

The app reads local V2 config from `data/v2-config.json`.

Defaults:

- OpenClaw telemetry endpoint: `ws://127.0.0.1:18789`
- GitHub repo: `stevologic/bob-sec`

## Fallback behavior

If either source is unavailable, the dashboard keeps working from the seeded local JSON snapshot.

## Live wiring

- OpenClaw uses a browser-safe WebSocket reconnect path against `ws://127.0.0.1:18789`.
- GitHub mirrors the public issues feed without embedding a powerful browser token.
- The source cards report the current live/fallback state and last sync time.

## Design notes

- V2 is still one page.
- The stage board is a visual layer over the same worker data.
- The canvas lane view is the first sprite-ready layer.
- The table/detail view remains the primary operator surface.

## Local run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production-style local check

```bash
npm run build
npm run start
```

## Docker

```bash
docker compose up --build
```

Then open <http://localhost:3000>.
