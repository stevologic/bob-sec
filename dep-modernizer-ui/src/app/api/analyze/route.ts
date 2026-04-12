import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRecommendation } from "@/lib/ai";
import { fetchDepsDevInsight } from "@/lib/depsdev";
import { fetchDependencySnapshot } from "@/lib/github";
import type { AnalyzeResponse, AiProvider, DependencyInsight } from "@/lib/types";
import { sampleInsight } from "@/lib/mock-data";

const bodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().optional(),
  githubToken: z.string().min(1),
  aiProvider: z.enum(["openai", "xai"]).optional(),
  aiApiKey: z.string().optional(),
  limit: z.number().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const deps = await fetchDependencySnapshot(body.githubToken, {
      owner: body.owner,
      repo: body.repo,
      branch: body.branch,
    });

    const selected = deps.slice(0, body.limit ?? 12);
    const insights: DependencyInsight[] = [];

    for (const dep of selected) {
      const depsInsight = await fetchDepsDevInsight(dep);
      const recommendation = await generateRecommendation({
        provider: body.aiProvider as AiProvider | undefined,
        apiKey: body.aiApiKey,
        repoFullName: `${body.owner}/${body.repo}`,
        dependency: dep,
        vulnerabilities: depsInsight.vulnerabilities,
        safeVersions: depsInsight.safeVersions,
      });

      insights.push({
        dependency: dep,
        vulnerabilities: depsInsight.vulnerabilities,
        safeVersions: depsInsight.safeVersions,
        latestSafeVersion: depsInsight.latestSafeVersion,
        recommendation,
      });
    }

    const response: AnalyzeResponse = {
      repo: { owner: body.owner, repo: body.repo, branch: body.branch },
      generatedAt: new Date().toISOString(),
      insights: insights.length ? insights : [sampleInsight],
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 400 },
    );
  }
}
