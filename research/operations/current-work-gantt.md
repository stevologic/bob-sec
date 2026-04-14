# Current Work Gantt

Manager view as of 2026-04-13 MST.

```mermaid
flowchart LR
    subgraph NOW[Now, 0 to 1h]
        I5[bob-sec#5<br/>Repo Normalization Cleanup]
        I1[bob-sec#1<br/>Mitigation Trend Shortlist v1]
        I2[bob-sec#2<br/>Pipeline Research Brief v1]
        I11[bob-sec#11<br/>Dashboard V1 Spec and Acceptance]
        I12[bob-sec#12<br/>Dashboard V1 Analyst Packet]
    end

    subgraph NEXT[Next, 1 to 6h]
        I13[bob-sec#13<br/>Dashboard V1 Build]
        I3[bob-sec#3<br/>OpenClaw Backup Baseline]
        I6[bob-sec#6<br/>Southwest Weekly Brief]
    end

    subgraph THEN[Then, 6 to 24h]
        I4[bob-sec#4<br/>Chiefs Daily Digest]
        I9[bob-sec#9<br/>Track 2 Maintenance Lane]
    end

    subgraph STANDING[Standing Lanes]
        I8[bob-sec#8<br/>OpenClaw Cluster SRE Lane]
        I7[bob-sec#7<br/>Repo Health and Enhancement Sweep]
    end

    I5 --> I3
    I1 --> I13
    I2 --> I13
    I11 --> I13
    I12 --> I13
    I6 --> I9

    classDef critical fill:#ffdddd,stroke:#cc0000,stroke-width:2px;
    classDef active fill:#d9ecff,stroke:#1d70b8,stroke-width:2px;
    classDef queued fill:#fff2cc,stroke:#d6a400,stroke-width:1px;
    classDef standing fill:#e7f7e7,stroke:#2f8f2f,stroke-width:1px;

    class I5,I1,I2,I11,I12 critical;
    class I13,I3,I6,I4,I9 queued;
    class I8,I7 standing;
```

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
