import type { AiUpgradeRecommendation, DependencyInsight } from "./types";

export const fallbackRecommendation: AiUpgradeRecommendation = {
  summary:
    "Review the changelog and test the upgrade behind a feature flag before merging.",
  rationale: [
    "No model key was provided, so this recommendation uses a defensive fallback template.",
    "Prefer a minor or patch upgrade first if the dependency graph is broad.",
  ],
  changedFunctions: [
    "Inspect release notes for renamed exports, removed options, and stricter type signatures.",
  ],
  backwardsCompatibility: [
    "Wrap the new API behind an adapter layer so existing callers do not need to change immediately.",
    "Keep a temporary compatibility shim for deprecated parameters until all callers are migrated.",
  ],
  rolloutPlan: [
    "Create a feature branch and update only this dependency.",
    "Run tests and smoke-check major user flows.",
    "Merge after the PR diff and CI results are reviewed.",
  ],
};

export const sampleInsight: DependencyInsight = {
  dependency: {
    id: "sample-npm-react-router",
    ecosystem: "npm",
    name: "react-router",
    version: "6.22.3",
    relation: "direct",
    manifestPath: "package.json",
    packageManager: "npm",
  },
  vulnerabilities: [],
  safeVersions: [
    { version: "6.23.1", isLatest: false },
    { version: "6.24.0", isLatest: false },
    { version: "6.25.1", isLatest: false },
    { version: "6.26.2", isLatest: false },
    { version: "6.27.0", isLatest: true },
  ],
  latestSafeVersion: { version: "6.27.0", isLatest: true },
  recommendation: fallbackRecommendation,
};
