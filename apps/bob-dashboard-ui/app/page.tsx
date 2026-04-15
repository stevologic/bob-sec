"use client";

import { type ReactNode, useState } from "react";
import dashboardSeed from "@/data/workers.json";
import dashboardConfig from "@/data/v2-config.json";

type Worker = {
  agent: string;
  role: string;
  currentIssue: string;
  status: string;
  lastUpdate: string;
  lastCommit: string;
  riskFlag: "low" | "medium" | "high";
  targetChannel: string;
  detail: {
    issue: string;
    update: string;
    commit: string;
    blocker: string;
    routingContext: string;
  };
};

type DashboardSeed = {
  generatedAt: string;
  summary: {
    activeWorkers: number;
    attentionNeeded: number;
    blockedWorkers: number;
    lastRefreshedAt: string;
  };
  workers: Worker[];
};

type DashboardConfig = {
  openclaw: {
    endpoint: string;
    label: string;
    status: string;
    fallback: string;
    note: string;
  };
  github: {
    owner: string;
    repo: string;
    label: string;
    status: string;
    fallback: string;
    note: string;
  };
};

const seed = dashboardSeed as DashboardSeed;
const config = dashboardConfig as DashboardConfig;

const stageOrder = ["backlog", "ready", "analyst", "engineer", "review", "blocked", "done"] as const;
type StageId = (typeof stageOrder)[number];
type SourceKey = "openclaw" | "github";

const statusTone: Record<string, string> = {
  "scope locked": "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  "packet drafting": "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  implementing: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  "decision pending": "bg-violet-500/15 text-violet-200 ring-violet-400/25",
  "client-side fallback": "bg-slate-500/15 text-slate-200 ring-slate-400/25",
};

const riskTone: Record<Worker["riskFlag"], string> = {
  low: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  medium: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  high: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
};

const stageTone: Record<StageId, string> = {
  backlog: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  ready: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  analyst: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
  engineer: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  review: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  blocked: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
  done: "bg-lime-500/15 text-lime-200 ring-lime-400/25",
};

const stageLabels: Record<StageId, string> = {
  backlog: "Backlog",
  ready: "Ready",
  analyst: "Analyst",
  engineer: "Engineer",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
};

function stageFor(worker: Worker): StageId {
  const blocker = `${worker.detail.blocker} ${worker.detail.routingContext}`.toLowerCase();

  if (worker.status.includes("done")) return "done";
  if (worker.status.includes("decision")) return "review";
  if (worker.riskFlag === "high" || blocker.includes("blocked") || blocker.includes("waiting")) return "blocked";
  if (worker.role === "research") return "analyst";
  if (worker.role === "build") return "engineer";
  if (worker.role === "coordination") return "ready";

  return "backlog";
}

function toDisplayTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg shadow-slate-950/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function RefreshButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10"
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(seed.workers[0]?.agent ?? "");
  const [syncTimes, setSyncTimes] = useState<Record<SourceKey, string>>({
    openclaw: seed.summary.lastRefreshedAt,
    github: seed.summary.lastRefreshedAt,
  });

  const selectedWorker = seed.workers.find((worker) => worker.agent === selectedAgent) ?? seed.workers[0];

  const summaryCards = [
    { label: "Active workers", value: seed.summary.activeWorkers, accent: "text-cyan-200" },
    { label: "Attention needed", value: seed.summary.attentionNeeded, accent: "text-amber-200" },
    { label: "Blocked workers", value: seed.summary.blockedWorkers, accent: "text-rose-200" },
    { label: "Last refreshed", value: seed.summary.lastRefreshedAt, accent: "text-white" },
  ];

  const sourceCards = [
    {
      key: "openclaw" as const,
      label: config.openclaw.label,
      status: config.openclaw.status,
      endpoint: config.openclaw.endpoint,
      fallback: config.openclaw.fallback,
      note: config.openclaw.note,
      lastSync: syncTimes.openclaw,
    },
    {
      key: "github" as const,
      label: config.github.label,
      status: config.github.status,
      endpoint: `${config.github.owner}/${config.github.repo}`,
      fallback: config.github.fallback,
      note: config.github.note,
      lastSync: syncTimes.github,
    },
  ];

  const stageBuckets = stageOrder.map((stage) => ({
    stage,
    workers: seed.workers.filter((worker) => stageFor(worker) === stage),
  }));

  const refreshSource = (source: SourceKey) => {
    setSyncTimes((previous) => ({
      ...previous,
      [source]: new Date().toISOString(),
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">bob-sec dashboard v2a</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Live ops shell, still read-only</h1>
              <p className="mt-2 max-w-4xl text-sm text-slate-300">
                V2A keeps the V1 utility, adds source controls for OpenClaw telemetry and GitHub issues, and shows a
                stage-lane map that stays useful even when the live bridge is still mocked.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Generated at {seed.generatedAt}
            </div>
          </div>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <MetricCard key={card.label} label={card.label} value={card.value} accent={card.accent} />
            ))}
          </section>
        </header>

        <section className="grid gap-6 xl:grid-cols-2">
          {sourceCards.map((source) => (
            <div key={source.key} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Source control</p>
                  <h2 className="mt-1 text-xl font-semibold">{source.label}</h2>
                  <p className="mt-1 text-sm text-slate-400">{source.note}</p>
                </div>
                <div className="flex gap-2">
                  <RefreshButton onClick={() => refreshSource(source.key)} label={`Refresh ${source.key === "openclaw" ? "telemetry" : "issues"}`} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <SourceStat label="Connection" value={source.status} tone={statusTone[source.status] ?? statusTone["client-side fallback"]} />
                <SourceStat label="Endpoint" value={source.endpoint} tone="bg-slate-500/15 text-slate-200 ring-slate-400/25" />
                <SourceStat label="Last sync" value={toDisplayTime(source.lastSync)} tone="bg-cyan-500/15 text-cyan-200 ring-cyan-400/25" />
                <SourceStat label="Fallback" value={source.fallback} tone="bg-amber-500/15 text-amber-200 ring-amber-400/25" />
              </div>
            </div>
          ))}
        </section>

        <Panel eyebrow="Stage board" title="Sprite-ready workflow lanes">
          <p className="mb-4 max-w-4xl text-sm text-slate-400">
            This is the first V2 stage map. It keeps the operator view readable, maps workers into lanes, and leaves
            room for a sprite or canvas layer later without replacing the table.
          </p>

          <div className="grid gap-4 xl:grid-cols-7">
            {stageBuckets.map(({ stage, workers }) => (
              <div key={stage} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Lane</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">{stageLabels[stage]}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${stageTone[stage]}`}>{workers.length}</span>
                </div>

                <div className="space-y-3">
                  {workers.length ? (
                    workers.map((worker) => (
                      <div key={worker.agent} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{worker.agent}</p>
                            <p className="text-xs text-slate-400">{worker.role}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${riskTone[worker.riskFlag]}`}>
                            {worker.riskFlag}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-300">{worker.currentIssue}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-500">
                      No workers in this lane yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Worker table</h2>
                <p className="text-sm text-slate-400">Click a row to inspect issue, blocker, stage, and routing context.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                Read-only, seeded JSON
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-3 py-2 font-medium">Agent</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Stage</th>
                    <th className="px-3 py-2 font-medium">Current issue</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Last update</th>
                    <th className="px-3 py-2 font-medium">Last commit</th>
                    <th className="px-3 py-2 font-medium">Risk flag</th>
                    <th className="px-3 py-2 font-medium">Target channel</th>
                  </tr>
                </thead>
                <tbody>
                  {seed.workers.map((worker) => {
                    const isSelected = worker.agent === selectedWorker.agent;
                    const stage = stageFor(worker);

                    return (
                      <tr
                        key={worker.agent}
                        onClick={() => setSelectedAgent(worker.agent)}
                        className={`cursor-pointer rounded-2xl transition ${isSelected ? "bg-cyan-500/15" : "bg-slate-900/70 hover:bg-white/8"}`}
                      >
                        <td className="rounded-l-2xl px-3 py-3 font-medium text-white">{worker.agent}</td>
                        <td className="px-3 py-3 text-slate-300">{worker.role}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${stageTone[stage]}`}>
                            {stageLabels[stage]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{worker.currentIssue}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              statusTone[worker.status] ?? "bg-slate-500/15 text-slate-200 ring-slate-400/25"
                            }`}
                          >
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{toDisplayTime(worker.lastUpdate)}</td>
                        <td className="px-3 py-3 text-slate-300">{worker.lastCommit}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${riskTone[worker.riskFlag]}`}
                          >
                            {worker.riskFlag}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-3 py-3 text-slate-300">{worker.targetChannel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Selected worker</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedWorker.agent}</h2>
                <p className="text-sm text-cyan-300">{selectedWorker.role}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${riskTone[selectedWorker.riskFlag]}`}>
                {selectedWorker.riskFlag}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <Detail label="Stage lane" value={stageLabels[stageFor(selectedWorker)]} />
              <Detail label="Issue" value={`${selectedWorker.currentIssue} · ${selectedWorker.detail.issue}`} />
              <Detail label="Update" value={selectedWorker.detail.update} />
              <Detail label="Commit" value={selectedWorker.detail.commit} />
              <Detail label="Blocker" value={selectedWorker.detail.blocker} />
              <Detail label="Routing context" value={selectedWorker.detail.routingContext} />
              <Detail label="Target channel" value={selectedWorker.targetChannel} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SourceStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 p-4 ring-1 ${tone}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-5 text-white">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-base leading-6 text-white">{value}</p>
    </div>
  );
}
