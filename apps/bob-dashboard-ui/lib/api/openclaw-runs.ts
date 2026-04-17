// OpenClaw runs API route (snapshot-first, no live claims)
// Reads from local snapshot, no auth required, no "live" telemetry

import { openclawRunsSnapshot } from "../dashboard-snapshot";
import type { AgentRun } from "../dashboard-types";

export async function GET() {
  return new Response(
    JSON.stringify(openclawRunsSnapshot as AgentRun[]),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
