// Dashboard V3 snapshot data (truth-first, no live claims)
// Used by /dashboard and /issues pages; API route at /api/openclaw/runs

// OpenClaw runs snapshot (inline for dashboard UI)
const openclawRunsSnapshot = [
  {
    id: "oc-run-001",
    agent: "planner",
    issueNumber: 412,
    task: "Outline dashboard V3 scaffold",
    status: "done",
    updatedAt: "2026-04-16T18:30:00Z",
    source: "snapshot",
  },
  {
    id: "oc-run-002",
    agent: "engineer",
    issueNumber: 417,
    task: "Wire truth-first dashboard shell",
    status: "running",
    updatedAt: "2026-04-16T19:45:00Z",
    source: "snapshot",
  },
];

// Full dashboard snapshot (for /dashboard page)
const dashboardSnapshot = {
  generatedAt: "2026-04-16T19:50:00Z",
  dataSource: "snapshot",
  liveStatus: "snapshot-only",
  agentRuns: openclawRunsSnapshot,
  subagentRuns: [
    {
      id: "sub-201",
      parentRunId: "oc-run-002",
      name: "route scaffold",
      task: "Add /dashboard and /issues routes",
      status: "done",
      updatedAt: "2026-04-16T19:52:00Z",
    },
    {
      id: "sub-202",
      parentRunId: "oc-run-002",
      name: "snapshot plumbing",
      task: "Load local truth-first data first",
      status: "running",
      updatedAt: "2026-04-16T19:54:00Z",
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Keep dashboard read-only",
      status: "done",
      issueNumber: 417,
      owner: "engineer",
      updatedAt: "2026-04-16T19:52:00Z",
    },
    {
      id: "task-2",
      title: "Expose honest source labels",
      status: "in_progress",
      issueNumber: 417,
      owner: "engineer",
      updatedAt: "2026-04-16T19:54:00Z",
    },
    {
      id: "task-3",
      title: "Connect live GitHub data later",
      status: "open",
      issueNumber: null,
      owner: "director",
      updatedAt: "2026-04-16T19:45:00Z",
    },
  ],
  issues: [
    {
      number: 417,
      title: "Dashboard V3 should be issue-backed and truth-first",
      state: "open",
      labels: ["dashboard", "ops"],
      url: "https://github.com/stevologic/bob-sec/issues/417",
      updatedAt: "2026-04-16T19:56:00Z",
    },
    {
      number: 412,
      title: "Clarify snapshot fallback behavior",
      state: "open",
      labels: ["dashboard", "safety"],
      url: "https://github.com/stevologic/bob-sec/issues/412",
      updatedAt: "2026-04-16T19:48:00Z",
    },
    {
      number: 401,
      title: "Reduce noise in OpenClaw error stream",
      state: "closed",
      labels: ["observability"],
      url: "https://github.com/stevologic/bob-sec/issues/401",
      updatedAt: "2026-04-16T19:30:00Z",
    },
  ],
  errors: [
    {
      id: "err-1",
      source: "OpenClaw gateway",
      message: "Telemetry socket unavailable, using snapshot data",
      severity: "warn",
      updatedAt: "2026-04-16T19:58:00Z",
    },
    {
      id: "err-2",
      source: "GitHub mirror",
      message: "No browser secret handling, fetches are snapshot-only in this scaffold",
      severity: "info",
      updatedAt: "2026-04-16T19:57:00Z",
    },
  ],
  events: [
    {
      id: "evt-1",
      kind: "sync",
      message: "Loaded local snapshot data for dashboard render",
      updatedAt: "2026-04-16T19:58:00Z",
    },
    {
      id: "evt-2",
      kind: "fallback",
      message: "Live sources are not claimed in this scaffold",
      updatedAt: "2026-04-16T19:58:00Z",
    },
  ],
};

export { openclawRunsSnapshot, dashboardSnapshot };
