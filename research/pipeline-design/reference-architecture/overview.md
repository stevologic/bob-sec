# Enterprise Security Pipeline Research Brief v1

Issue: `bob-sec#2`  
Track: Pipeline Design  
Owner: Analyst  
Date: 2026-04-13

## Objective
Define a practical enterprise security pipeline structure, map the major stages, note enterprise and OSS tool options, connect the pipeline to recognizable control frameworks, and recommend what should be built first.

## Recommended Pipeline Stages
1. **Plan**
   - threat modeling inputs
   - dependency and architecture intent
   - policy baselines for repos, runners, and environments
2. **Code**
   - secrets scanning
   - SAST and code-quality checks
   - branch protection and signed-commit preferences
3. **Build**
   - software composition analysis (SCA)
   - SBOM generation
   - build provenance and artifact attestation
4. **Test**
   - IaC scanning
   - container/image scanning
   - DAST or targeted integration checks where appropriate
5. **Release**
   - artifact signing
   - policy gates for severity thresholds and exception handling
   - promotion approval workflow
6. **Deploy**
   - admission controls
   - environment-specific policy validation
   - drift detection hooks
7. **Operate**
   - runtime detection
   - vulnerability re-correlation against deployed assets
   - evidence retention for audit and post-incident review

## Design View
The cleanest reference architecture for bob-sec is an opinionated **open-source-first baseline** with room for enterprise substitutions later. That keeps the design credible for smaller teams while still mapping cleanly onto larger commercial stacks.

A strong default flow is:
- Git provider and CI orchestrator trigger on commit or PR
- secrets, SAST, and SCA run early
- SBOM is generated during build
- container and IaC scanning run before promotion
- artifacts are signed before release
- deploy-time policy checks validate integrity and configuration
- runtime telemetry feeds back into vulnerability and drift prioritization

## Compliance and Control Considerations
### NIST SSDF
Useful as the primary lifecycle framing model because it maps well to secure development practices, verification, and remediation loops.

### SLSA
Best fit for build provenance, artifact integrity, and release assurance. Especially important if bob-sec wants a serious software supply-chain story instead of just a scan collection.

### OWASP CI/CD Security Guidance
Useful for practical hardening at repo, runner, secret, and pipeline-permission layers.

### CIS Controls v8 / NIST CSF 2.0
Good secondary mapping for operational governance, asset visibility, vulnerability handling, and monitoring expectations.

## Tooling Recommendation Summary
- Prefer an OSS default path first, then map enterprise alternatives beside it.
- Keep the stack modular so each stage can be swapped without rewriting the whole architecture.
- Treat SBOM plus signing plus policy gates as core, not optional extras.

See `tooling-matrix.md` for the stage-by-stage tool options.

## Recommendation on What Should Be Built First
Build the **Build-to-Release Integrity module** first.

Why this module first:
- it captures the highest-leverage controls that many teams still lack, namely SCA, SBOM generation, image scanning, signing, and promotion gates
- it creates a reusable center of gravity for later repo, deploy, and runtime modules
- it is easier to validate with concrete artifacts than a broad abstract diagram alone
- it aligns well with current buyer and operator attention on supply-chain trust and deploy-time assurance

If bob-sec wants one repo-backed asset immediately, the first implementation package should include:
- one Mermaid reference diagram
- one tooling matrix
- one opinionated open-source baseline
- one enterprise substitution matrix
- one control mapping section for SSDF and SLSA

## Sources
- NIST SSDF overview and 2026 DevSecOps material: https://csrc.nist.gov/pubs/other/2026/03/24/devsecops-practices/iprd
- OWASP CI/CD Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html
- CNCF supply-chain security paper: https://github.com/cncf/tag-security/blob/main/community/working-groups/supply-chain-security/supply-chain-security-paper-v2/SSCBPv2.md
- Example supply-chain pipeline repo: https://github.com/nfroze/Supply-Chain-Security-Pipeline
- Market/tooling context gathered via current 2026 DevSecOps pipeline research
