# Build-to-Release Integrity Gate POC

This prototype is a small, repo-backed release gate scaffold that checks what a build must prove before promotion.

## What it models
- SBOM present
- signing present
- SCA/image checks passed
- release policy gate
- approved exception path with expiry

## Inputs
- a tiny JSON build summary
- required fields:
  - `sbom` (`present` or `missing`)
  - `signed` (`true` or `false`)
  - `sca_passed` (`true` or `false`)
  - `image_scanned` (`true` or `false`)
  - `policy_exception` (`true` or `false`)
- exception metadata when `policy_exception` is `true`:
  - `approval_record.approved`
  - `approval_record.approver`
  - `approval_record.approved_at`
  - `approval_record.expires_at`
  - `approval_record.reason`

## Output
- human-readable release gate lines
- JSON summary on the final line for CI consumption
- exit `0` when the release is allowed
- exit `1` when a seeded policy violation blocks release

## Current shape
- `gate.sh`, a deterministic gate simulator
- `sample-input.json`, a passing example payload
- `sample-blocked-expired-approval.json`, a blocked example payload

## Usage
```bash
./gate.sh sample-input.json
./gate.sh sample-blocked-expired-approval.json
```

## Next increment
- validate real SBOM/signature artifacts
- wire in actual SCA/image scan results
- replace the stub exception path with an approval record and expiry workflow
- emit the JSON summary into CI logs or a downstream check step
