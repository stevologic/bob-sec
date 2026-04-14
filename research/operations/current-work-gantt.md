# Current Work Gantt

Manager view as of 2026-04-13 MST.

```mermaid
sankey-beta
Now,bob-sec#5 Repo Normalization Cleanup,1
Now,bob-sec#1 Mitigation Trend Shortlist v1,1
Now,bob-sec#2 Pipeline Research Brief v1,1
Now,bob-sec#11 Dashboard V1 Spec and Acceptance,1
Now,bob-sec#12 Dashboard V1 Analyst Packet,1
Next,bob-sec#13 Dashboard V1 Build,1
Next,bob-sec#3 OpenClaw Backup Baseline,1
Next,bob-sec#6 Southwest Weekly Brief,1
Then,bob-sec#4 Chiefs Daily Digest,1
Then,bob-sec#9 Track 2 Maintenance Lane,1
Standing,bob-sec#8 OpenClaw Cluster SRE Lane,1
Standing,bob-sec#7 Repo Health and Enhancement Sweep,1
```

## Bucket Meaning
- **Now**: 0 to 1h
- **Next**: 1 to 6h
- **Then**: 6 to 24h
- **Standing**: recurring or ongoing lanes

## Critical Path
1. `bob-sec#5`
2. `bob-sec#1`
3. `bob-sec#2`
4. `bob-sec#11` and `bob-sec#12`
5. `bob-sec#13`
6. `bob-sec#3`

## Queue Summary
- **Now**: `#5`, `#1`, `#2`, `#11`, `#12`
- **Next**: `#13`, `#3`, `#6`
- **Then / Standing**: `#4`, `#7`, `#8`, `#9`
