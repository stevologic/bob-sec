# OpenClaw Backup Baseline

This baseline covers the minimum OpenClaw operating state needed to rebuild the current working setup without committing private runtime archives into git.

## What lives here

- `inventory.md` - what is in scope, what is out of scope, and why
- `restore.md` - ordered restore procedure
- `validation.md` - checks used to verify the backup and restore path
- `create-backup.sh` - local archive creation script
- `manifests/` - include and exclude manifests used by the script

## Quick start

Dry-run the current backup selection:

```bash
./infrastructure/backup/openclaw/create-backup.sh --dry-run
```

Create a local archive in a private output directory:

```bash
./infrastructure/backup/openclaw/create-backup.sh ./tmp/openclaw-backups
```

## Scope summary

Included in the baseline:
- `~/.openclaw/openclaw.json`
- `~/.openclaw/cron/jobs.json`
- root workspace operating files plus the full `~/.openclaw/workspace/analyst/`, `director/`, `manager/`, and `engineer/` directories
- `~/.openclaw/workspace/team-shared/`, `~/.openclaw/workspace/scripts/`, and `~/.openclaw/workspace/memory/`
- per-agent `models.json` files under `~/.openclaw/agents/*/agent/`
- per-agent `sessions/sessions.json` index files so each agent directory has restore-relevant session metadata without pulling full transcripts

Explicitly excluded from the repo-tracked baseline:
- auth profiles and auth state
- session transcripts
- delivery queues, task databases, media caches, and other volatile runtime state
- device pairing/auth files that should be re-established on restore

## Storage rule

The generated archive can contain secrets. Keep it in a private encrypted location and do not commit the archive to git.
