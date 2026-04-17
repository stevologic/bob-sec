import Link from "next/link";
import { dashboardSnapshot } from "@/lib/dashboard-snapshot";
import type { GitHubIssue, OpenClawError, AgentRun } from "@/lib/dashboard-types";

const statusTone: Record<string, string> = {
  snapshot: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  done: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  running: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  blocked: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
  open: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  closed: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  warn: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  error: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
  info: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
};

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tone}`}>{children}</span>;
}

function RunCard({ run }: { run: AgentRun }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{run.agent}</p>
          <h3 className="mt-1 font-semibold text-white">{run.task}</h3>
        </div>
        <Chip tone={statusTone[run.status] ?? statusTone.snapshot}>{run.status}</Chip>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        <span>Issue {run.issueNumber ?? "n/a"}</span>
        <span>·</span>
        <span>{timeLabel(run.updatedAt)}</span>
        <span>·</span>
        <span>{run.source}</span>
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: GitHubIssue }) {
  return (
    <a href={issue.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">#{issue.number}</p>
          <h3 className="mt-1 font-semibold text-white">{issue.title}</h3>
        </div>
        <Chip tone={statusTone[issue.state] ?? statusTone.open}>{issue.state}</Chip>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        <span>{timeLabel(issue.updatedAt)}</span>
        <span>·</span>
        <span>{issue.labels.join(", ") || "no labels"}</span>
      </div>
    </a>
  );
}

function ErrorCard({ error }: { error: OpenClawError }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{error.source}</p>
          <h3 className="mt-1 font-semibold text-white">{error.message}</h3>
        </div>
        <Chip tone={statusTone[error.severity] ?? statusTone.info}>{error.severity}</Chip>
      </div>
      <p className="mt-3 text-xs text-slate-400">{timeLabel(error.updatedAt)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const snapshot = dashboardSnapshot;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">bob-sec dashboard v3 scaffold</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Truth-first, read-only ops dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Snapshot-backed only for now, with honest status labels and no browser secrets.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {snapshot.liveStatus} · generated {timeLabel(snapshot.generatedAt)}
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-sm">
            <Link className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10" href="/issues">Issues</Link>
            <span className="rounded-full border border-white/10 px-4 py-2 text-slate-300">Read-only</span>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="OpenClaw live runs" eyebrow="Panel 1">
            <div className="space-y-3">
              {snapshot.agentRuns.map((run) => <RunCard key={run.id} run={run} />)}
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Fallback: local snapshot data.</div>
            </div>
          </Panel>

          <Panel title="bob-sec GitHub issues" eyebrow="Panel 2">
            <div className="space-y-3">
              {snapshot.issues.map((issue) => <IssueCard key={issue.number} issue={issue} />)}
            </div>
          </Panel>

          <Panel title="OpenClaw errors" eyebrow="Panel 3">
            <div className="space-y-3">
              {snapshot.errors.map((error) => <ErrorCard key={error.id} error={error} />)}
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Source handling is explicit, no live secrets are embedded.</div>
            </div>
          </Panel>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Subagent runs" eyebrow="Supporting truth layer">
            <div className="space-y-3">
              {snapshot.subagentRuns.map((run) => (
                <div key={run.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{run.name}</p>
                      <h3 className="mt-1 font-semibold text-white">{run.task}</h3>
                    </div>
                    <Chip tone={statusTone[run.status] ?? statusTone.snapshot}>{run.status}</Chip>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Parent run {run.parentRunId} · {timeLabel(run.updatedAt)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="System events" eyebrow="Honest status">
            <div className="space-y-3">
              {snapshot.events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white">{event.message}</h3>
                    <Chip tone={statusTone.snapshot}>{event.kind}</Chip>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{timeLabel(event.updatedAt)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
