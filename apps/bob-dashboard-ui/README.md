# bob-dashboard-ui

Thin V1 read-only operations dashboard for `bob-sec`.

## Scope

This app is intentionally small:

- one page only
- seeded local JSON dataset
- summary strip
- worker table
- selected-worker detail panel
- no auth, writes, websockets, or live backends

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

## Seed data

The app reads local data from `data/workers.json`.
