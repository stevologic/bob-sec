# Dashboard V2 Notes

## Architecture

V2 keeps the one-page Next.js shell from V1, but adds two source control cards and a stage-lane board.

- OpenClaw telemetry stays client-side only.
- GitHub issue reads stay client-side only unless a safe bridge is introduced later.
- The normal table/detail view remains the primary utility surface.
- The stage board is a visual layer over the same underlying data, not a separate control plane.

## Data-source mapping

### OpenClaw telemetry

- endpoint: `ws://127.0.0.1:18789`
- purpose: live worker/session freshness when a safe client-side path exists
- fallback: seeded worker snapshot and local freshness timestamps

### GitHub issues

- repo: `stevologic/bob-sec`
- purpose: work queue, issue status, and attention signals
- fallback: seeded issue snapshot and local freshness timestamps
- safety rule: do not place a powerful token in the browser for private repo access

## Config instructions

The dashboard reads local config from `apps/bob-dashboard-ui/data/v2-config.json`.

Update that file to change:

- OpenClaw endpoint
- GitHub owner/repo
- client-side fallback copy

## Fallback behavior

If either source is unavailable, V2 stays usable from the seeded JSON data.
The refresh controls only advance local freshness until a live bridge is safe.
