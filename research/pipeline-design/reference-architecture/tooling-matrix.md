# Tooling Matrix, Enterprise Security Pipeline v1

## Stage-by-Stage Options

| Stage | Primary security concern | OSS-friendly options | Enterprise options |
| --- | --- | --- | --- |
| Code | leaked secrets, insecure code, unsafe dependencies entering early | Gitleaks, Semgrep Community, Trivy filesystem scan | GitHub Advanced Security, GitGuardian, Checkmarx, Cycode |
| Build | dependency risk, SBOM gaps, provenance | Trivy, Syft, Grype | Snyk, Veracode, Mend, OX Security |
| Infrastructure | misconfigured Terraform, Kubernetes, cloud templates | Checkov, tfsec, Terrascan | Wiz, Prisma Cloud, Checkmarx Cloud |
| Container / Artifact | vulnerable images, unsigned artifacts, weak provenance | Trivy, Grype, Cosign, Sigstore | Prisma Cloud, Wiz, Snyk Container, Anchore Enterprise |
| Test / Release | policy drift, late discovery, weak promotion gates | OWASP ZAP, OPA / Conftest, Gatekeeper | Burp Suite Enterprise, Harness STO, commercial policy orchestration |
| Deploy / Operate | drift, runtime abuse, unpatched workloads | Falco, KubeArmor, Prometheus plus alerting | Wiz Runtime, Lacework, Upwind, Sysdig Secure |

## Recommended Bob-Sec Baseline
- **Repo and PR gate:** Gitleaks + Semgrep/Trivy
- **Build and dependency gate:** Trivy + Syft
- **IaC gate:** Checkov
- **Container gate:** Trivy or Grype
- **Artifact integrity:** Cosign/Sigstore
- **Policy enforcement:** OPA/Conftest or Gatekeeper
- **Runtime signal:** Falco

## Enterprise Upgrade Path
If the target audience is larger security teams with budget, the clearest enterprise comparison set is:
- GitHub Advanced Security or Cycode at repo and code stages
- Snyk, Mend, or Veracode at dependency and container stages
- Wiz or Prisma Cloud for posture plus runtime correlation
- Checkmarx or OX Security for broader ASPM-style consolidation

## Build-First Module Boundary
The first module should include:
- SCA
- SBOM generation
- container/image scan
- artifact signing
- promotion policy gate

That module is the strongest initial implementation target because it is compact, demonstrable, and ties directly to supply-chain trust.
