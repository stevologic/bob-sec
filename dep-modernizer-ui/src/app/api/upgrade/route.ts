import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUpgradePullRequest } from "@/lib/github";

const bodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().optional(),
  githubToken: z.string().min(1),
  dependencyName: z.string().min(1),
  currentVersion: z.string().min(1),
  targetVersion: z.string().min(1),
  recommendationSummary: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await createUpgradePullRequest({
      token: body.githubToken,
      repo: { owner: body.owner, repo: body.repo, branch: body.branch },
      dependencyName: body.dependencyName,
      targetVersion: body.targetVersion,
      body: `## Dependency upgrade request\n\n- Dependency: ${body.dependencyName}\n- Current version: ${body.currentVersion}\n- Target version: ${body.targetVersion}\n\n## Recommendation summary\n${body.recommendationSummary}\n\n> Note: this PR is created as a draft for human review before any code changes are applied.`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upgrade failed" },
      { status: 400 },
    );
  }
}
