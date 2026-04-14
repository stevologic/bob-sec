# OpenClaw Restore Procedure

## Goal

Restore the documented OpenClaw operating baseline onto a trusted host with minimal ambiguity and with explicit separation between repo-tracked artifacts and secret-bearing runtime state.

## Preconditions

- A trusted target host
- OpenClaw installed on the target host
- Access to a private backup archive created by `create-backup.sh`
- Access to any secrets or auth material that were intentionally excluded from the baseline

## Restore order

1. Install OpenClaw on the target host.
2. Stop OpenClaw services before replacing files.
3. Extract the backup archive into a temporary staging directory.
4. Restore configuration files.
5. Restore workspace files.
6. Restore per-agent model baselines.
7. Run OpenClaw setup/status checks.
8. Re-inject excluded secrets or re-pair devices if needed.
9. Validate the restored environment.

## Detailed steps

### 1. Install OpenClaw

Use the standard install path for the host. Confirm the base directory exists:

```bash
ls ~/.openclaw
```

### 2. Stop services

```bash
openclaw gateway stop
```

If the gateway is managed another way on the host, stop that process before continuing.

### 3. Extract to staging

```bash
mkdir -p ~/tmp/openclaw-restore
mkdir -p ~/tmp/openclaw-restore/staging

tar -xzf /path/to/openclaw-config-backup-YYYYmmdd-HHMMSS.tar.gz \
  -C ~/tmp/openclaw-restore/staging
```

### 4. Restore configuration

```bash
cp ~/tmp/openclaw-restore/staging/openclaw.json ~/.openclaw/openclaw.json
mkdir -p ~/.openclaw/cron
cp ~/tmp/openclaw-restore/staging/cron/jobs.json ~/.openclaw/cron/jobs.json
```

### 5. Restore workspace files

Restore the staged workspace slices into the live workspace root:

```bash
rsync -a ~/tmp/openclaw-restore/staging/workspace/ ~/.openclaw/workspace/
```

If `rsync` is unavailable, use `cp -a` with care:

```bash
cp -a ~/tmp/openclaw-restore/staging/workspace/. ~/.openclaw/workspace/
```

### 6. Restore agent model baselines

```bash
mkdir -p ~/.openclaw/agents/analyst/agent \
  ~/.openclaw/agents/director/agent \
  ~/.openclaw/agents/engineer/agent \
  ~/.openclaw/agents/main/agent \
  ~/.openclaw/agents/manager/agent

cp ~/tmp/openclaw-restore/staging/agents/analyst/agent/models.json ~/.openclaw/agents/analyst/agent/models.json
cp ~/tmp/openclaw-restore/staging/agents/director/agent/models.json ~/.openclaw/agents/director/agent/models.json
cp ~/tmp/openclaw-restore/staging/agents/engineer/agent/models.json ~/.openclaw/agents/engineer/agent/models.json
cp ~/tmp/openclaw-restore/staging/agents/main/agent/models.json ~/.openclaw/agents/main/agent/models.json
cp ~/tmp/openclaw-restore/staging/agents/manager/agent/models.json ~/.openclaw/agents/manager/agent/models.json
```

### 7. Re-seed missing defaults and inspect status

```bash
openclaw setup
openclaw status
```

### 8. Re-inject excluded state

The default baseline does not restore:
- auth profiles
- auth state
- session history
- device identity and pairings
- volatile runtime databases and caches

Handle those separately:
- restore secrets from a password manager or other trusted secret source
- re-run channel auth flows if required
- re-pair mobile/device clients if required

### 9. Validate

Run the validation steps in `validation.md`.

## Verification checklist

A restore is considered acceptable when:
- `openclaw status` succeeds
- the expected workspace files are present under `~/.openclaw/workspace/`
- `cron/jobs.json` is present and readable
- the documented agent `models.json` files are restored
- services can be restarted without config parse errors

## Restart

```bash
openclaw gateway start
openclaw status
```
