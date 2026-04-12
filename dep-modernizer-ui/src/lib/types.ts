export type AiProvider = "openai" | "xai";

export interface RepoInput {
  owner: string;
  repo: string;
  branch?: string;
}

export interface DependencyRecord {
  id: string;
  ecosystem: string;
  name: string;
  version: string;
  relation: string;
  manifestPath?: string;
  packageManager?: string;
}

export interface VulnerabilityRecord {
  source: string;
  severity: string;
  title: string;
  advisoryUrl?: string;
}

export interface SafeVersionCandidate {
  version: string;
  isLatest: boolean;
  publishedAt?: string;
}

export interface AiUpgradeRecommendation {
  summary: string;
  rationale: string[];
  changedFunctions: string[];
  backwardsCompatibility: string[];
  rolloutPlan: string[];
}

export interface DependencyInsight {
  dependency: DependencyRecord;
  vulnerabilities: VulnerabilityRecord[];
  safeVersions: SafeVersionCandidate[];
  latestSafeVersion?: SafeVersionCandidate;
  recommendation: AiUpgradeRecommendation;
}

export interface AnalyzeResponse {
  repo: RepoInput;
  generatedAt: string;
  insights: DependencyInsight[];
}
