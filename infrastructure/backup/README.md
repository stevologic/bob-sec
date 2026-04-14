# Infrastructure Backups

This directory holds backup baselines, restore notes, and validation records for infrastructure-related operating state used by `bob-sec`.

## Current baseline

- `openclaw/` - OpenClaw configuration backup baseline, including:
  - inventory of included and excluded artifacts
  - a runnable backup script
  - restore procedure
  - validation notes

## Repo rule

Version the documentation, manifests, and scripts here.
Do not commit raw backup archives, secrets, or extracted private runtime state into this repository.
