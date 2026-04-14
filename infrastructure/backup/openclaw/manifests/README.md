# OpenClaw backup manifests

These manifests drive `create-backup.sh`.

- `include-paths.txt` lists source paths to archive, relative to `~/.openclaw`
- `exclude-globs.txt` lists relative patterns to skip from the resulting archive

Update both manifests whenever the OpenClaw operating footprint changes materially.
