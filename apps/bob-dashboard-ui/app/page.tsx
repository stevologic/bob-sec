"use client";

import { useMemo, useState } from "react";
import workers from "@/data/workers.json";

type Worker = {
  id: string;
  name: string;
  role: string;
  status: "On track" | "At risk" | "Blocked" | "Done";
  progress: number;
  currentTask: string;
  blocker: string;
  issue: string;
  updatedAt: string;
  nextMilestone: string;
};

const workerData = workers as Worker[];

const statusTone: Record<Worker["status"], string> = {
  "On track": "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  "At risk": "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Blocked: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  Done: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
};

export default function Home() {
  const [selectedId, setSelectedId] = useState(workerData[0]?.id ?? "");

  const selectedWorker =
    workerData.find((worker) => worker.id === selectedId) ?? workerData[0];

  const summary = useMemo(() => {
    const blocked = workerData.filter((worker) => worker.status === "Blocked").length;
    const atRisk = workerData.filter((worker) => worker.status === "At risk").length;
    const done = workerData.filter((worker) => worker.status === "Done").length;
    const averageProgress = Math.round(
      workerData.reduce((total, worker) => total + worker.progress, 0) / workerData.length,
    );

    return {
      total: workerData.length,
      blocked,
      atRisk,
      done,
      averageProgress,
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">bob-sec dashboard v1</p>
              <h1 className="text-3xl font-semibold tracking-tight">Read-only ops snapshot</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Seeded demo view of the current four-agent operating picture. This is intentionally thin,
                local-data only, and optimized for a fast V1 deadline.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Updated from local seed data, no live writes
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Workers", value: summary.total, tone: "text-cyan-200" },
              { label: "Average progress", value: `${summary.averageProgress}%`, tone: "text-white" },
              { label: "At risk", value: summary.atRisk, tone: "text-amber-300" },
              { label: "Blocked", value: summary.blocked, tone: "text-rose-300" },
              { label: "Done", value: summary.done, tone: "text-emerald-300" },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
              </div>
            ))}
          </section>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Worker table</h2>
                <p className="text-sm text-slate-400">Click a row to inspect that worker.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-3 py-2 font-medium">Worker</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Progress</th>
                    <th className="px-3 py-2 font-medium">Issue</th>
                    <th className="px-3 py-2 font-medium">Current task</th>
                  </tr>
                </thead>
                <tbody>
                  {workerData.map((worker) => {
                    const isSelected = worker.id === selectedWorker.id;

                    return (
                      <tr
                        key={worker.id}
                        onClick={() => setSelectedId(worker.id)}
                        className={`cursor-pointer rounded-2xl transition ${
                          isSelected ? "bg-cyan-500/15" : "bg-slate-900/70 hover:bg-white/8"
                        }`}
                      >
                        <td className="rounded-l-2xl px-3 py-3">
                          <div className="font-medium text-white">{worker.name}</div>
                          <div className="text-xs text-slate-400">{worker.role}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusTone[worker.status]}`}
                          >
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-cyan-400"
                                style={{ width: `${worker.progress}%` }}
                              />
                            </div>
                            <span>{worker.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{worker.issue}</td>
                        <td className="rounded-r-2xl px-3 py-3 text-slate-300">{worker.currentTask}</td>
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
                <h2 className="mt-1 text-2xl font-semibold">{selectedWorker.name}</h2>
                <p className="text-sm text-cyan-300">{selectedWorker.role}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone[selectedWorker.status]}`}
              >
                {selectedWorker.status}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-slate-400">Current task</p>
                <p className="mt-1 text-base text-white">{selectedWorker.currentTask}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Next milestone</p>
                <p className="mt-1 text-base text-white">{selectedWorker.nextMilestone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Blocker</p>
                <p className="mt-1 text-base text-white">{selectedWorker.blocker}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Issue</p>
                <p className="mt-1 text-base text-white">{selectedWorker.issue}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last update</p>
                <p className="mt-1 text-base text-white">{selectedWorker.updatedAt}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
