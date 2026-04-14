# OpenClaw Backup Inventory

## Objective

Capture the minimum host-local OpenClaw operating state required to rebuild the current environment consistently after host loss, corruption, or a bad configuration change.

## Source root

Primary source root: `/home/stevo-claw/.openclaw`

## Current observed configuration snapshot

Observed on 2026-04-13 during issue `bob-sec#3` baseline work:

- `openclaw status` reports the gateway service is installed, enabled, and running
- active channel: Discord
- default workspace root in config: `/home/stevo-claw/.openclaw/workspace`
- top-level config/runtime areas present: `agents/`, `cron/`, `workspace/`, `logs/`, `memory/`, `tasks/`, `flows/`, `delivery-queue/`, `media/`

## Included artifacts

| Path | Why it matters | Notes |
| --- | --- | --- |
| `openclaw.json` | Main OpenClaw configuration and routing baseline | Treat archive as secret-bearing |
| `cron/jobs.json` | Scheduled jobs and automation cadence | Needed to reconstruct recurring jobs |
| selected `workspace/` files and directories | Shared operating docs, agent workspace files, and working notes | Includes root workspace docs, `team-shared/`, `scripts/`, `memory/`, and the full `workspace/analyst`, `workspace/director`, `workspace/manager`, and `workspace/engineer` directories needed for current operating context |
| per-agent `models.json` files under `agents/*/agent/` | Agent model baselines | Non-secret config |
| per-agent `sessions/sessions.json` index files | Preserves session index metadata for each agent without backing up full transcripts | Includes `analyst`, `director`, `engineer`, `main`, `manager`, and `default` session indices |

## Excluded artifacts

| Path or pattern | Why excluded |
| --- | --- |
| `agents/*/agent/auth-profiles.json` | Contains auth profile material and API credential references |
| `agents/*/agent/auth-state.json` | Contains live auth state |
| `agents/*/sessions/*.jsonl*`, lock/checkpoint/deleted files, and `sessions.json.bak-*` | Transcript store and transient session debris are large, private, or not required for config reconstruction |
| `delivery-queue/`, `flows/`, `tasks/`, `media/`, `memory/`, `logs/` | Volatile runtime state, caches, or generated data |
| `devices/`, `identity/` | Pairing and device identity should be re-established deliberately on restore |
| `openclaw.json.bak*`, `openclaw.json.clobbered*` | Historical spillover copies, not part of the clean baseline |
| `workspace/engineer/bob-sec.backup-*` | Legacy backup checkout, not needed for the clean baseline |
| nested `.git/` directories under `workspace/` | Repository metadata should be restored from git remotes, not from backup tarballs |
| nested `.openclaw/` workspace-state files under `workspace/` | Ephemeral per-workspace local state |

## Proposed backup structure

Generated archives should follow this naming pattern:

```text
openclaw-config-backup-YYYYmmdd-HHMMSS.tar.gz
```

Recommended private storage layout outside the repo:

```text
<private-backup-root>/
  openclaw/
    current/
      openclaw-config-backup-YYYYmmdd-HHMMSS.tar.gz
    archive/
      2026/
        openclaw-config-backup-YYYYmmdd-HHMMSS.tar.gz
```

## Notes

- This repo stores the script, manifests, and docs, not the raw backup archive.
- Because `openclaw.json` may include sensitive configuration, generated archives should be encrypted at rest or stored in a trusted private location.
- If device pairings or auth state become business-critical later, add them in a separate higher-trust backup tier rather than mixing them into the default baseline.
