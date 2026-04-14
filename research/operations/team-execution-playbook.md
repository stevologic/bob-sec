# Team Execution Playbook

This file mirrors the Director-approved execution playbook so the active GitHub repo contains the same operating guidance the team is using in chat and shared workspace files.

## Purpose
Create one clear way for Director, Manager, Analyst, and Engineer to communicate, execute, document, commit, and hand off work without ambiguity.

## Core Principle
If the work changed reality, it must also change the issue, the repo, and the documentation.

## Operating Rules
1. GitHub Issues are the work control plane.
2. Discord is for direction, escalation, approvals, summaries, and blockers.
3. The repo is the source of implementation truth.
4. Shared docs are the source of operating truth.
5. No important work should live only in someone’s head or only in chat.

## Communication Rules
### Director
- sets strategic direction
- approves material scope changes
- intervenes on priorities, architecture, and risk

### Manager
- owns issue creation, assignment, sequencing, QA, and closeout
- is decisive by default when the scope is already approved
- does not wait passively when the next action is clear

### Analyst
- researches, clarifies, and prepares decision-ready or implementation-ready inputs
- cites sources and notes confidence when signals are weak

### Engineer
- implements, tests, documents, commits, and pushes
- escalates before risky changes
- does not leave undocumented behavior behind

## Standard Message Format
When posting significant work updates, use:
- [SUMMARY]
- [TASKS ASSIGNED]
- [NEXT STEPS]
- [BLOCKERS]
- [FILES CREATED/UPDATED]

Keep updates short, specific, and decision-useful.

## Issue Discipline
Before work starts:
1. open or confirm the GitHub Issue
2. assign an owner
3. define expected output
4. define repo path
5. define done condition

Before handoff:
1. refresh shallow `bob-sec` repo context
2. record Repo Context Checked, Base Commit, and Files Read
3. note drift, blockers, or collisions in the issue

## Documentation Discipline
Documentation must be updated with every material change.

That includes changes to:
- behavior
- workflow
- repo structure
- schedules or cron jobs
- dashboards
- feeds
- backup/restore paths
- security posture or SRE procedures
- acceptance criteria

Minimum expectation:
- update the nearest README or runbook for implementation changes
- update shared operating files for workflow or priority changes
- update issue comments when the plan or result changed materially

No material change is complete if the documentation is stale.

## Commit and Push Rules
1. Commit every meaningful unit of work.
2. Keep commits atomic when possible.
3. Use clear commit messages that describe what changed.
4. Push changes after the work unit is complete and verified.
5. Reference issue numbers in commits or issue comments when practical.
6. If a commit changes behavior, also update docs in the same work unit.

## Required Closeout for Any Work Item
A work item is not done until all of the following are true:
1. implementation or research artifact exists in the repo
2. relevant documentation is updated
3. GitHub Issue is updated with the result
4. commit is pushed or explicitly handed off for push
5. blockers or follow-up work are captured

## Escalation Rules
Escalate in Discord before acting when the change could impact:
- connectivity
- remote access
- firewall or SSH behavior
- credentials or secrets
- production-like data
- destructive cleanup
- service uptime

If low-risk and within approved scope, act first and report immediately after.

## Manager Enforcement Standard
Manager is responsible for enforcing:
- no ownerless issues
- no undocumented material changes
- no repo-changing work without a commit plan
- no “done” status when docs are stale
- no silent blockers

## 4-Hour Execution Loop
### Manager
- every 4 hours, post a concise execution report in `#director-vision`
- the report should cover vision execution, project deliverables, GitHub issue state, status, and roadblocks
- between reports, maintain GitHub Issues actively and keep the queue moving
- if Analyst or Engineer are pending on assigned work, check in within `#manager-ops` and @mention them for an update
- when one item completes, assign the next issue-backed work immediately

### Director
- every 4 hours, review the latest Manager report in `#director-vision`
- reply with strategic correction, priority changes, approvals, or reinforcement as needed
- stay quiet only when the Manager report is accurate and no strategic adjustment is needed

### Report Format
Use:
- [SUMMARY]
- [TASKS ASSIGNED]
- [NEXT STEPS]
- [BLOCKERS]
- [FILES CREATED/UPDATED]

## Initial Work To Stand Up This Playbook
1. create issues for communication standards rollout
2. create issues for commit/push discipline rollout
3. create issues for documentation hygiene rollout
4. add templates or checklists where needed
5. audit open work against this playbook and correct gaps

## Success Condition
The team becomes easy to trust because anyone can answer:
- what changed
- why it changed
- where it was documented
- what commit holds it
- what happens next
