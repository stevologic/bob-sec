export type RunStatus = "queued" | "running" | "blocked" | "done" | "failed";
export type SourceStatus = "snapshot" | "connected" | "degraded" | "offline";

export type AgentRun = {
  id: string;
  agent: string;
  issueNumber: number | null;
  task: string;
  status: RunStatus;
  updatedAt: string;
  source: SourceStatus;
};

export type SubagentRun = {
  id: string;
  parentRunId: string;
  name: string;
  task: string;
  status: RunStatus;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "blocked" | "done";
  issueNumber: number | null;
  owner: string;
  updatedAt: string;
};

export type GitHubIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  url: string;
  updatedAt: string;
};

export type OpenClawError = {
  id: string;
  source: string;
  message: string;
  severity: "info" | "warn" | "error";
  updatedAt: string;
};

export type SystemEvent = {
  id: string;
  kind: "sync" | "fallback" | "health";
  message: string;
  updatedAt: string;
};

export type DashboardSnapshot = {
  generatedAt: string;
  dataSource: "snapshot";
  liveStatus: "snapshot-only";
  agentRuns: AgentRun[];
  subagentRuns: SubagentRun[];
  tasks: Task[];
  issues: GitHubIssue[];
  errors: OpenClawError[];
  events: SystemEvent[];
};
