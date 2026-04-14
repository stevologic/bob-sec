# OpenClaw Backup Validation

## Validation goal

Confirm that the backup baseline is reproducible, excludes the intended volatile/auth state, and provides enough material to rebuild the operating setup on a clean host.

## Validation cadence

- after any material OpenClaw configuration change
- after cron/job changes
- after workspace structure changes
- monthly restore review

## Initial baseline validation

Performed during initial `bob-sec#3` baseline setup on 2026-04-13.

### Checks completed

- reviewed `openclaw status` to confirm current live service state
- inspected top-level `~/.openclaw` layout to confirm source directories exist
- created a repo-tracked include manifest and exclude manifest
- added a runnable `create-backup.sh` script for repeatable archive creation
- ran a dry-run path audit successfully
- created a timestamped local test archive at `./tmp/openclaw-backups/openclaw-config-backup-20260413-181254.tar.gz`
- inspected archive contents and confirmed expected baseline files were present

### Checks to run for each refresh

#### 1. Dry-run path selection

```bash
./infrastructure/backup/openclaw/create-backup.sh --dry-run
```

Expected result:
- prints the effective include paths
- reports the effective exclude patterns
- exits non-zero if no include paths resolve

#### 2. Create a fresh local archive

```bash
mkdir -p ./tmp/openclaw-backups
./infrastructure/backup/openclaw/create-backup.sh ./tmp/openclaw-backups
```

Expected result:
- one timestamped tarball is created
- script warns that the archive may contain secrets

#### 3. Inspect archive contents

```bash
tar -tzf ./tmp/openclaw-backups/openclaw-config-backup-*.tar.gz | head -n 200
```

Expected result:
- includes `openclaw.json`, `cron/jobs.json`, selected workspace slices, and selected `models.json` files
- does not include auth-state, transcript, or volatile runtime directories

#### 4. Clean-host restore rehearsal

Restore into a disposable directory or test host using `restore.md`.

Expected result:
- `openclaw setup` and `openclaw status` complete
- workspace docs and cron definitions land in the expected paths
- any excluded secrets are identified explicitly rather than silently missing

## Validation notes

- This baseline intentionally favors clean rebuildability over full forensic preservation.
- If transcript retention, pairing continuity, or auth migration become required, add a second backup tier with tighter storage controls.
