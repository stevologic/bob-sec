import Link from "next/link";
import { dashboardSnapshot } from "@/lib/dashboard-snapshot";

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function IssuesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">bob-sec issues</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Issue-backed, read-only list</h1>
          <p className="mt-2 text-sm text-slate-300">This route stays honest, showing the same local snapshot data that feeds the dashboard scaffold.</p>
          <div className="mt-4 flex gap-3 text-sm">
            <Link className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10" href="/dashboard">Dashboard</Link>
            <span className="rounded-full border border-white/10 px-4 py-2 text-slate-300">Snapshot only</span>
          </div>
        </header>

        <section className="space-y-3">
          {dashboardSnapshot.issues.map((issue) => (
            <a key={issue.number} href={issue.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">#{issue.number}</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{issue.title}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs">{issue.state}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span>{timeLabel(issue.updatedAt)}</span>
                <span>·</span>
                <span>{issue.labels.join(", ") || "no labels"}</span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
