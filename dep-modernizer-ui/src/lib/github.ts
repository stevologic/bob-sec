import { Octokit } from "@octokit/rest";
import type { DependencyRecord, RepoInput } from "./types";

interface SnapshotResponse {
  version: number;
  sha: string;
  ref: string;
  detector: { name: string; version: string };
  scanned: string;
  manifests: Record<
    string,
    {
      name?: string;
      file?: { source_location?: string };
      metadata?: { package_manager?: string };
      resolved?: {
        dependencies?: Array<{
          package_url?: string;
          relationship?: string;
          scope?: string;
          dependencies?: string[];
        }>;
      };
    }
  >;
}

function parsePackageUrl(packageUrl = "") {
  const withoutPrefix = packageUrl.replace(/^pkg:/, "");
  const [ecoAndName, version] = withoutPrefix.split("@");
  const firstSlash = ecoAndName.indexOf("/");
  return {
    ecosystem: firstSlash >= 0 ? ecoAndName.slice(0, firstSlash) : "unknown",
    name: firstSlash >= 0 ? ecoAndName.slice(firstSlash + 1) : ecoAndName,
    version: version || "unknown",
  };
}

export async function fetchDependencySnapshot(
  token: string,
  repo: RepoInput,
): Promise<DependencyRecord[]> {
  const octokit = new Octokit({ auth: token });
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/dependency-graph/sbom",
    {
      owner: repo.owner,
      repo: repo.repo,
      headers: {
        accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const data = response.data as SnapshotResponse;
  const deps: DependencyRecord[] = [];

  for (const [manifestPath, manifest] of Object.entries(data.manifests || {})) {
    const packageManager = manifest.metadata?.package_manager;
    const resolved = manifest.resolved?.dependencies || [];

    resolved.forEach((dep, idx) => {
      const parsed = parsePackageUrl(dep.package_url);
      deps.push({
        id: `${manifestPath}:${parsed.name}:${idx}`,
        ecosystem: parsed.ecosystem,
        name: parsed.name,
        version: parsed.version,
        relation: dep.relationship || dep.scope || "indirect",
        manifestPath,
        packageManager,
      });
    });
  }

  return deps;
}

export async function createUpgradePullRequest(params: {
  token: string;
  repo: RepoInput;
  dependencyName: string;
  targetVersion: string;
  body: string;
}) {
  const octokit = new Octokit({ auth: params.token });
  const baseBranch = params.repo.branch || "main";
  const branchName = `upgrade/${params.dependencyName.replace(/[^a-zA-Z0-9-_]/g, "-")}-${params.targetVersion}`;

  const { data: repoData } = await octokit.repos.get({
    owner: params.repo.owner,
    repo: params.repo.repo,
  });

  const defaultBranch = params.repo.branch || repoData.default_branch || baseBranch;
  const { data: refData } = await octokit.git.getRef({
    owner: params.repo.owner,
    repo: params.repo.repo,
    ref: `heads/${defaultBranch}`,
  });

  await octokit.git.createRef({
    owner: params.repo.owner,
    repo: params.repo.repo,
    ref: `refs/heads/${branchName}`,
    sha: refData.object.sha,
  });

  const title = `chore: prepare ${params.dependencyName} upgrade to ${params.targetVersion}`;
  const pr = await octokit.pulls.create({
    owner: params.repo.owner,
    repo: params.repo.repo,
    head: branchName,
    base: defaultBranch,
    title,
    body: params.body,
    maintainer_can_modify: true,
    draft: true,
  });

  return {
    url: pr.data.html_url,
    number: pr.data.number,
    branchName,
  };
}
