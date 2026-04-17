// OpenClaw runs snapshot reader (truth-first, snapshot-only)
// TODO: replace with live websocket auth when contract is proven

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

export const openclawRunsSnapshot = openclawRunsSnapshot;
