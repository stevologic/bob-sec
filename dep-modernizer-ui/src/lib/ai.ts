import type {
  AiProvider,
  AiUpgradeRecommendation,
  DependencyRecord,
  SafeVersionCandidate,
  VulnerabilityRecord,
} from "./types";
import { fallbackRecommendation } from "./mock-data";

function buildPrompt(params: {
  repo: string;
  dependency: DependencyRecord;
  vulnerabilities: VulnerabilityRecord[];
  safeVersions: SafeVersionCandidate[];
}) {
  return `You are a senior software modernization and compatibility engineer. Analyze this dependency upgrade request and produce concise JSON.

Repo: ${params.repo}
Dependency: ${params.dependency.name}
Current version: ${params.dependency.version}
Ecosystem: ${params.dependency.ecosystem}
Relation: ${params.dependency.relation}
Manifest path: ${params.dependency.manifestPath || "unknown"}
Known vulnerabilities: ${JSON.stringify(params.vulnerabilities)}
Safe version candidates: ${JSON.stringify(params.safeVersions)}

Return strict JSON with keys:
summary: string
rationale: string[]
changedFunctions: string[]
backwardsCompatibility: string[]
rolloutPlan: string[]

Focus on defensive maintenance, probable API changes, migration risks, and ways to preserve backward compatibility.`;
}

async function callOpenAI(apiKey: string, prompt: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "upgrade_recommendation",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              rationale: { type: "array", items: { type: "string" } },
              changedFunctions: { type: "array", items: { type: "string" } },
              backwardsCompatibility: {
                type: "array",
                items: { type: "string" },
              },
              rolloutPlan: { type: "array", items: { type: "string" } },
            },
            required: [
              "summary",
              "rationale",
              "changedFunctions",
              "backwardsCompatibility",
              "rolloutPlan",
            ],
          },
        },
      },
    }),
  });

  if (!response.ok) throw new Error("OpenAI request failed");
  const data = await response.json();
  const output = data.output?.[0]?.content?.[0]?.text;
  if (!output) throw new Error("OpenAI empty response");
  return JSON.parse(output) as AiUpgradeRecommendation;
}

async function callXai(apiKey: string, prompt: string) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4-1-fast",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output strict JSON only. No markdown. No prose outside JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error("xAI request failed");
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("xAI empty response");
  return JSON.parse(content) as AiUpgradeRecommendation;
}

export async function generateRecommendation(params: {
  provider?: AiProvider;
  apiKey?: string;
  repoFullName: string;
  dependency: DependencyRecord;
  vulnerabilities: VulnerabilityRecord[];
  safeVersions: SafeVersionCandidate[];
}): Promise<AiUpgradeRecommendation> {
  if (!params.apiKey || !params.provider) {
    return fallbackRecommendation;
  }

  const prompt = buildPrompt({
    repo: params.repoFullName,
    dependency: params.dependency,
    vulnerabilities: params.vulnerabilities,
    safeVersions: params.safeVersions,
  });

  try {
    return params.provider === "openai"
      ? await callOpenAI(params.apiKey, prompt)
      : await callXai(params.apiKey, prompt);
  } catch {
    return fallbackRecommendation;
  }
}
