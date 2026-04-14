# GANTT

## Condensed Timeline
Window start: 2026-04-13 MST

Legend:
- `█` active now
- `▒` queued next
- `▓` standing / recurring lane
- `!` critical path pressure

| Workstream / Issue | Owner | Now (0 to 1h) | Next (1 to 6h) | Then (6 to 24h) | Standing | Notes |
|---|---|---:|---:|---:|---:|---|
| `bob-sec#5` Repo Normalization Cleanup | Engineer | █ ! | █ ! |  |  | Must land cleanly before more repo-backed Engineer work |
| `bob-sec#1` Mitigation Trend Shortlist v1 | Analyst | █ ! | █ |  |  | Needs decision-ready refinement fast |
| `bob-sec#2` Pipeline Research Brief v1 | Analyst | █ ! | █ |  |  | Needs decision-ready refinement fast |
| `bob-sec#11` Dashboard V1 Spec / Acceptance | Manager | █ ! | █ |  |  | Locks scope for dashboard build |
| `bob-sec#12` Dashboard V1 Analyst Packet | Analyst | █ ! | █ |  |  | Schema, sources, seeded sample |
| `bob-sec#13` Dashboard V1 Build | Engineer | ▒ | █ ! | █ |  | Fresh app, Docker-runnable, read-only |
| `bob-sec#3` OpenClaw Backup Baseline | Engineer | ▒ | █ ! | █ |  | Starts immediately after `#5` is safe |
| `bob-sec#6` Southwest Weekly Brief | Manager / Analyst | ▒ | █ | █ ! |  | Nearest fixed delivery target |
| `bob-sec#4` Chiefs Daily Digest | Analyst | ▒ | █ | █ | ▓ | Feed-only lane |
| `bob-sec#8` OpenClaw Cluster SRE Lane | Engineer |  |  |  | ▓ | Read-first maintenance lane |
| `bob-sec#7` Repo Health / Enhancement Sweep | Engineer |  | ▒ | ▒ | ▓ | Idle-cycle improvement lane |
| `bob-sec#9` Track 2 Maintenance Lane | Analyst |  | ▒ | █ | ▓ | Recurring pipeline reference upkeep |

## Critical Path
1. `bob-sec#5`
2. `bob-sec#1`
3. `bob-sec#2`
4. `bob-sec#11` and `#12`
5. `bob-sec#13`
6. `bob-sec#3`

## Manager Queue
- **Now**: `#5`, `#1`, `#2`, `#11`, `#12`
- **Next**: `#13`, `#3`, `#6`
- **Standing**: `#4`, `#7`, `#8`, `#9`
