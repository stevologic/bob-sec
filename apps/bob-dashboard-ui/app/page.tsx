"use client";

import { useMemo, useState } from "react";
import dashboardSeed from "@/data/workers.json";

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

const seed = dashboardSeed as DashboardSeed;

const statusTone: Record<string, string> = {
  "scope locked": "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  "packet drafting": "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  implementing: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  "decision pending": "bg-violet-500/15 text-violet-200 ring-violet-400/25",
};

const riskTone: Record<Worker["riskFlag"], string> = {
  low: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  medium: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  high: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
};

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg shadow-slate-950/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(seed.workers[0]?.agent ?? "");

  const selectedWorker =
    seed.workers.find((worker) => worker.agent === selectedAgent) ?? seed.workers[0];

  const summaryCards = useMemo(
    () => [
      { label: "Active workers", value: seed.summary.activeWorkers, accent: "text-cyan-200" },
      { label: "Attention needed", value: seed.summary.attentionNeeded, accent: "text-amber-200" },
      { label: "Blocked workers", value: seed.summary.blockedWorkers, accent: "text-rose-200" },
      { label: "Last refreshed", value: seed.summary.lastRefreshedAt, accent: "text-white" },
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">bob-sec dashboard v1</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Read-only ops snapshot</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Seeded four-worker view for the approved V1. This build is intentionally read-only, local-data only,
                and tuned for a fast Docker run with a table-first layout.
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

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Worker table</h2>
                <p className="text-sm text-slate-400">Click a row to inspect issue, blocker, and routing context.</p>
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

                    return (
                      <tr
                        key={worker.agent}
                        onClick={() => setSelectedAgent(worker.agent)}
                        className={`cursor-pointer rounded-2xl transition ${
                          isSelected ? "bg-cyan-500/15" : "bg-slate-900/70 hover:bg-white/8"
                        }`}
                      >
                        <td className="rounded-l-2xl px-3 py-3 font-medium text-white">{worker.agent}</td>
                        <td className="px-3 py-3 text-slate-300">{worker.role}</td>
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
                        <td className="px-3 py-3 text-slate-300">{worker.lastUpdate}</td>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-base leading-6 text-white">{value}</p>
    </div>
  );
}
