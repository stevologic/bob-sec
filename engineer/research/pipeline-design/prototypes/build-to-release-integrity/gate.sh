#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${1:-sample-input.json}"

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "gate: missing input file: $INPUT_FILE" >&2
  exit 2
fi

python3 - "$INPUT_FILE" <<'PY'
import json
import sys
from datetime import datetime, timezone

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

violations = []

sbom = str(data.get('sbom', ''))
signed = bool(data.get('signed', False))
sca_passed = bool(data.get('sca_passed', False))
image_scanned = bool(data.get('image_scanned', False))
policy_exception = bool(data.get('policy_exception', False))
approval = data.get('approval_record') or {}

if sbom != 'present':
    violations.append('SBOM missing')
if not signed:
    violations.append('Artifact not signed')
if not sca_passed:
    violations.append('SCA failed')
if not image_scanned:
    violations.append('Image scan failed')

exception_approved = False
approval_status = 'not_requested'
approval_meta = {
    'approved': False,
    'approver': '',
    'approved_at': '',
    'expires_at': '',
    'reason': '',
}


def parse_iso8601(value: str):
    if not value:
        return None
    value = str(value).strip().replace('Z', '+00:00')
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

if policy_exception:
    if not isinstance(approval, dict):
        violations.append('Approval record missing')
        approval_status = 'missing'
    else:
        approval_meta['approved'] = bool(approval.get('approved', False))
        approval_meta['approver'] = str(approval.get('approver', ''))
        approval_meta['approved_at'] = str(approval.get('approved_at', ''))
        approval_meta['expires_at'] = str(approval.get('expires_at', ''))
        approval_meta['reason'] = str(approval.get('reason', ''))

        if not approval_meta['approved']:
            violations.append('Approval not approved')
            approval_status = 'rejected'
        else:
            approval_status = 'approved'
            expires_at = approval_meta['expires_at']
            if not expires_at:
                violations.append('Approval expiration missing')
                approval_status = 'missing_expiry'
            else:
                try:
                    expires_dt = parse_iso8601(expires_at)
                    if expires_dt is None:
                        violations.append('Approval expiration missing')
                        approval_status = 'missing_expiry'
                    elif expires_dt <= datetime.now(timezone.utc):
                        violations.append('Approval expired')
                        approval_status = 'expired'
                    else:
                        exception_approved = True
                except Exception:
                    violations.append('Approval expiration invalid')
                    approval_status = 'invalid_expiry'

allowed = len(violations) == 0
blocked = not allowed

if allowed:
    if policy_exception:
        print('gate: exception approved, release allowed')
    else:
        print('gate: release allowed')
else:
    print('gate: release blocked')
    for violation in violations:
        print(f' - {violation}')
    if policy_exception and approval_status in {'rejected', 'missing_expiry', 'expired', 'invalid_expiry', 'missing'}:
        print('gate: exception requested but not approved')

summary = {
    'allowed': allowed,
    'blocked': blocked,
    'violations': violations,
    'exception_requested': policy_exception,
    'exception_approved': exception_approved,
    'approval_status': approval_status,
    'approval_record': approval_meta,
}
print(json.dumps(summary, sort_keys=True, separators=(',', ':')))

sys.exit(0 if allowed else 1)
PY