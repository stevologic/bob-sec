# Initial Cycle Mitigation Trend Shortlist v1

Issue: `bob-sec#1`  
Track: Mitigations  
Owner: Analyst  
Date: 2026-04-13

## Objective
Identify up to three mitigation opportunities that are recurring enough to justify a lightweight defensive prototype, then recommend which one should advance first.

## Executive Recommendation
Advance **Candidate 1, Internet-Exposed Admin Surface Triage Watchdog** first.

Why this one first:
- it maps cleanly to active operator pain, especially KEV-style externally exposed management products
- it can be demonstrated quickly with a practical scanner or inventory-check workflow
- it has broader reuse value than a single product-specific patch note
- it fits bob-sec well as a lightweight, high-signal defensive utility

## Candidate 1, Internet-Exposed Admin Surface Triage Watchdog
**Opportunity:** Build a small detection utility that fingerprints exposed admin or management surfaces, correlates them with known exploited or recently critical products, and produces a prioritized remediation list.

**Rationale:** The current cycle already includes a strong signal that internet-facing management products remain high-value targets. `CVE-2026-1340` for Ivanti Endpoint Manager Mobile is in CISA KEV and ties directly to exposed management infrastructure risk. That pattern is broader than one vendor: operators consistently struggle less with finding patches than with quickly identifying which externally reachable systems deserve immediate attention. A compact watchdog that checks a host inventory or scan results against a small signature set and urgency feed would create immediate defensive value. It is also easy to explain, easy to test, and relevant to small teams that do not have a full ASM platform.

**Suggested prototype type:** CLI or script that ingests hostnames/IPs, fingerprints likely admin surfaces, tags matches against a curated high-priority product list, and emits a remediation report.

## Candidate 2, Untrusted Model Intake Gate for ML Pipelines
**Opportunity:** Build a guardrail that blocks or quarantines unsafe model artifacts before they reach inference, notebooks, or CI jobs.

**Rationale:** `CVE-2026-1462` shows that even "safe" model-loading modes can fail when deserialization logic still permits attacker-controlled artifacts to pull in executable content. This is a useful mitigation direction because ML teams increasingly exchange models as if they were passive data files when they are effectively executable supply-chain objects. A lightweight gate that flags risky model formats, requires signed or approved sources, and enforces a quarantine review step would be more durable than reacting to one library bug at a time. The downside is narrower operator adoption than Candidate 1, because the audience is strongest in ML-enabled environments.

## Candidate 3, Safe Git Invocation Policy Wrapper
**Opportunity:** Build a wrapper or policy check that enforces allowlisted Git commands and options whenever untrusted input can influence automation.

**Rationale:** `CVE-2026-28291` is a good example of why regex blocklists are weak protection for developer tooling. When Git option parsing is flexible, defenders get more leverage from explicit allowlists and context-aware wrappers than from trying to blacklist every dangerous combination. A small mitigation artifact here could help CI pipelines, self-service deployment tooling, or multi-tenant automation paths that expose Git operations indirectly. This is a credible and teachable mitigation project, but it is somewhat more implementation-sensitive and narrower in immediate buyer/operator appeal than Candidate 1.

## Recommendation on What Should Advance First
Advance **Candidate 1** first.

It has the best mix of urgency, repeatability, and prototype simplicity. The KEV tie-in gives it near-term relevance, the exposed-management-surface problem recurs across vendors, and the resulting artifact would be understandable to both practitioners and buyers. Candidates 2 and 3 are still good backlog items, especially if bob-sec wants to lean into ML supply-chain safety or developer-tool hardening later in the cycle.

Refinement note, 2026-04-14 MST: current 2026 trend reporting still supports exposed admin surfaces, CTEM, attack-path validation, and identity-centric detection as the right framing. Keep the first prototype narrowly focused on ingesting inventory or scan results, mapping to high-priority exposed surfaces, and emitting an urgency-ranked triage list.

## Sources
- NVD, CVE-2026-1340: https://nvd.nist.gov/vuln/detail/CVE-2026-1340
- CISA KEV Catalog: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- NVD, CVE-2026-1462: https://nvd.nist.gov/vuln/detail/CVE-2026-1462
- NVD, CVE-2026-28291: https://nvd.nist.gov/vuln/detail/CVE-2026-28291
