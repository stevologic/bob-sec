# Dashboard V2 Vision

This file mirrors the Director-scoped V2 dashboard vision so execution and documentation can happen from the repo as well as chat.

## Purpose
Evolve the V1 worker dashboard into a richer live operations surface that still stays lightweight, readable, and fun.

## Core V2 Goal
Combine live OpenClaw telemetry and GitHub issue state into one browser-based dashboard so humans can see:
- what each worker is doing now
- what work is queued next
- where blockers exist
- what needs attention

## Data Sources
### 1. OpenClaw telemetry
- source: WebSocket connection on port `18789`
- role: live worker/session/heartbeat-style state where available
- configuration: endpoint should be configurable in the site
- access pattern: client side only
- controls: dedicated refresh or reconnect control and connection status indicator

### 2. GitHub issues for the home repo
- source: GitHub Issues for the primary repo
- role: planned work, assigned work, issue status, and work ahead
- configuration: repo owner and repo name should be configurable in the site
- access pattern: client side only
- controls: dedicated refresh button and freshness indicator

## Important Constraint
Client-side-only GitHub access is acceptable only if the issue data is public or otherwise exposed safely without leaking sensitive credentials into the browser.

If the repo is private, do not solve that by hardcoding a powerful token into the client. In that case, keep V2 partially mocked until a safe read path exists or explicitly scope a safe read-only bridge later.

## UI Vision
### Retain V1 utility
Keep the practical V1 surfaces:
- summary strip
- worker table
- selected-worker detail panel

### Add V2 visual layer
Add a 2D sprite or canvas layer that is driven by the same underlying data, not by manual placement.

The sprite board should show:
- workers as distinct sprites
- current work stage
- queued work ahead
- blockers or warning state
- completion or movement cues

## Sprite Rules
- sprite positions should map to real workflow stages
- no manual dragging as part of core operation
- canvas is a visual layer over real issue and telemetry state
- sprite mode must not replace the normal table/detail view
- degraded mode should still work if the canvas fails

## Recommended Stage Model
Use stage lanes such as:
- backlog
- ready
- analyst
- engineer
- review
- blocked
- done

Map both OpenClaw telemetry and GitHub issue state into these stages so the sprite view and table view stay consistent.

## Controls
V2 should include:
- refresh OpenClaw telemetry button
- refresh GitHub issues button
- connection or freshness indicator for each source
- last sync timestamp per source
- clear error state if one source is unavailable

## Documentation Requirement
V2 is not complete until it includes:
- architecture note
- data-source mapping note
- config instructions
- README updates
- clear explanation of client-side-only constraints
- fallback behavior when one source is missing

## Manager Scope Direction
Manager should turn this into documented execution, not immediate sprawl.

### First Manager questions
1. What exact OpenClaw telemetry is available over the WebSocket on `18789`?
2. What issue fields from GitHub can be safely consumed client side?
3. What is the exact stage mapping between telemetry and issue data?
4. What is the smallest V2 slice that proves value without overbuilding?

### Required issue split
- Analyst issue: telemetry and GitHub field research, trust levels, and stage mapping
- Engineer issue: V2 implementation and canvas layer
- Manager issue: V2 scope, acceptance criteria, and documentation enforcement

## Success Condition
V2 should feel alive and informative without becoming a game or a second control plane.
It should improve operator visibility while keeping the system understandable, debuggable, and documented.
