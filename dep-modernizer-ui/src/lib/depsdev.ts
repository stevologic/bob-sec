import semver from "semver";
import type {
  DependencyRecord,
  SafeVersionCandidate,
  VulnerabilityRecord,
} from "./types";

interface DepsDevVersion {
  versionKey?: { version?: string };
  isDefault?: boolean;
  publishedAt?: string;
  advisories?: Array<{
    source?: string;
    severity?: string;
    title?: string;
    url?: string;
  }>;
}

function depsDevPackageUrl(dep: DependencyRecord) {
  return `https://api.deps.dev/v3/systems/${encodeURIComponent(dep.ecosystem)}/packages/${encodeURIComponent(dep.name)}`;
}

export async function fetchDepsDevInsight(dep: DependencyRecord): Promise<{
  vulnerabilities: VulnerabilityRecord[];
  safeVersions: SafeVersionCandidate[];
  latestSafeVersion?: SafeVersionCandidate;
}> {
  try {
    const response = await fetch(depsDevPackageUrl(dep), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { vulnerabilities: [], safeVersions: [] };
    }

    const data = (await response.json()) as { versions?: DepsDevVersion[] };
    const versions = data.versions || [];
    const current = versions.find(
      (item) => item.versionKey?.version === dep.version,
    );

    const vulnerabilities = (current?.advisories || []).map((advisory) => ({
      source: advisory.source || "deps.dev",
      severity: advisory.severity || "unknown",
      title: advisory.title || "Security advisory",
      advisoryUrl: advisory.url,
    }));

    const safeVersions = versions
      .filter((item) => (item.advisories || []).length === 0)
      .map((item) => ({
        version: item.versionKey?.version || "0.0.0",
        isLatest: false,
        publishedAt: item.publishedAt,
      }))
      .filter((item) => semver.valid(item.version))
      .sort((a, b) => semver.rcompare(a.version, b.version));

    const nextFive = safeVersions.slice(0, 5).map((item, idx) => ({
      ...item,
      isLatest: idx === 0,
    }));

    return {
      vulnerabilities,
      safeVersions: nextFive,
      latestSafeVersion: nextFive[0],
    };
  } catch {
    return { vulnerabilities: [], safeVersions: [] };
  }
}
