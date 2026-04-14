// GitHub Integration using @octokit/rest
import GitHub from '@octokit/rest';
import { context } from 'next/server';

// Initialize Octokit with API token from environment
const octokit = new GitHub({
  authentication: process.env.GITHUB_TOKEN,
});

// Rate limiting middleware
octokit.hook('rate-limiting', {
  type: 'after-response',
  option: {
    key: context?.env?.GITHUB_REF || 'global',
    limit: 5000, // Higher limit for Next.js
    reset: () => Math.floor(Date.now() / 1000),
  },
});

// Get GitHub repo info
export async function getRepoInfo(owner: string, repo: string) {
  try {
    const response = await octokit.repos.get({ owner, repo });
    return response.data;
  } catch (error) {
    console.error(`Failed to get repo info for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Check if repo has activity in last 24h
export async function checkRecentActivity(owner: string, repo: string, days = 1) {
  try {
    const response = await octokit.activity.listRepositoryEvents({
      owner,
      repo,
      period: `${days}d`,
    });
    return response.data.length > 0;
  } catch (error) {
    console.error(`Failed to check activity for ${owner}/${repo}:`, error);
    return false;
  }
}

// Get PR list
export async function getPRs(owner: string, repo: string, state = 'open', milestoneId?: number) {
  try {
    const response = await octokit.pulls.list({
      owner,
      repo,
      state,
      milestone_id: milestoneId,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get PRs for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Create a PR
export async function createPR(owner: string, repo: string, title: string, body: string, head: string, base: string = 'main') {
  try {
    const response = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to create PR for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Get repo commits
export async function getCommits(owner: string, repo: string, sha?: string) {
  try {
    const response = await octokit.repos.listCommitComments({
      owner,
      repo,
      sha,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get commits for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Webhook endpoint for GitHub events
export const config = {
  runtime: 'edge',
};

// GitHub webhook handler
export async function GET(
  req: Request,
  { params }: { params: { repoId?: string } }
) {
  const { repoId } = params;
  const webhookPayload = await req.json();
  
  // Log GitHub webhook events for debugging
  await logToDB('office', 'github_webhook', JSON.stringify({ repoId, payload: webhookPayload }));
  
  return new Response(JSON.stringify({ status: 'handled', webhookPayload }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default octokit;
