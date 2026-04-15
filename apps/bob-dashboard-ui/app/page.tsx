"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type GitHubIssue = {
  number: number;
  title: string;
  state: string;
  updatedAt: string;
  url: string;
  labels: string[];
};

type SourceKey = "openclaw" | "github";
type SourceStatus = "connecting" | "connected" | "fallback" | "error";

type SourceState = Record<SourceKey, { status: SourceStatus; lastSync: string; detail: string }>;

type StageId = (typeof stageOrder)[number];

const seed = dashboardSeed as DashboardSeed;
const config = dashboardConfig as DashboardConfig;

const stageOrder = ["backlog", "ready", "analyst", "engineer", "review", "blocked", "done"] as const;

const statusTone: Record<string, string> = {
  "scope locked": "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  "packet drafting": "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  implementing: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  "decision pending": "bg-violet-500/15 text-violet-200 ring-violet-400/25",
  "client-side fallback": "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  connecting: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  connected: "bg-lime-500/15 text-lime-200 ring-lime-400/25",
  fallback: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  error: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
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

const riskFill: Record<Worker["riskFlag"], { fill: string; stroke: string; text: string }> = {
  low: { fill: "#10b981", stroke: "#34d399", text: "#ecfdf5" },
  medium: { fill: "#f59e0b", stroke: "#fbbf24", text: "#fffbeb" },
  high: { fill: "#f43f5e", stroke: "#fb7185", text: "#fff1f2" },
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

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function coerceString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length ? value : fallback;
}

function coerceNumber(value: unknown, fallback: number) {
  const candidate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(candidate) ? candidate : fallback;
}

function coerceRiskFlag(value: unknown): Worker["riskFlag"] {
  if (value === "medium" || value === "high") return value;
  return "low";
}

function coerceWorker(raw: unknown): Worker | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  const detailCandidate = candidate.detail && typeof candidate.detail === "object" ? (candidate.detail as Record<string, unknown>) : {};

  const agent = coerceString(candidate.agent);
  if (!agent) return null;

  return {
    agent,
    role: coerceString(candidate.role, "coordination"),
    currentIssue: coerceString(candidate.currentIssue, "n/a"),
    status: coerceString(candidate.status, "backlog"),
    lastUpdate: coerceString(candidate.lastUpdate, seed.summary.lastRefreshedAt),
    lastCommit: coerceString(candidate.lastCommit, "n/a"),
    riskFlag: coerceRiskFlag(candidate.riskFlag),
    targetChannel: coerceString(candidate.targetChannel, "#bot-updates"),
    detail: {
      issue: coerceString(detailCandidate.issue, "n/a"),
      update: coerceString(detailCandidate.update, "n/a"),
      commit: coerceString(detailCandidate.commit, "n/a"),
      blocker: coerceString(detailCandidate.blocker, "none"),
      routingContext: coerceString(detailCandidate.routingContext, "n/a"),
    },
  };
}

function coerceDashboardSnapshot(raw: unknown): Partial<DashboardSeed> | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  const next: Partial<DashboardSeed> = {};
  let touched = false;

  if (typeof candidate.generatedAt === "string") {
    next.generatedAt = candidate.generatedAt;
    touched = true;
  }

  if (candidate.summary && typeof candidate.summary === "object") {
    const summaryCandidate = candidate.summary as Record<string, unknown>;
    next.summary = {
      activeWorkers: coerceNumber(summaryCandidate.activeWorkers, seed.summary.activeWorkers),
      attentionNeeded: coerceNumber(summaryCandidate.attentionNeeded, seed.summary.attentionNeeded),
      blockedWorkers: coerceNumber(summaryCandidate.blockedWorkers, seed.summary.blockedWorkers),
      lastRefreshedAt: coerceString(summaryCandidate.lastRefreshedAt, seed.summary.lastRefreshedAt),
    };
    touched = true;
  }

  if (Array.isArray(candidate.workers)) {
    const workers = candidate.workers.map(coerceWorker).filter((worker): worker is Worker => Boolean(worker));
    if (workers.length) {
      next.workers = workers;
      touched = true;
    }
  }

  return touched ? next : null;
}

function mergeDashboard(previous: DashboardSeed, patch: Partial<DashboardSeed>) {
  return {
    generatedAt: patch.generatedAt ?? previous.generatedAt,
    summary: patch.summary ?? previous.summary,
    workers: patch.workers ?? previous.workers,
  };
}

function coerceGithubIssue(raw: unknown): GitHubIssue | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  if (candidate.pull_request) return null;

  const number = coerceNumber(candidate.number, Number.NaN);
  const title = coerceString(candidate.title);
  const url = coerceString(candidate.html_url || candidate.url);

  if (!Number.isFinite(number) || !title || !url) return null;

  return {
    number,
    title,
    state: coerceString(candidate.state, "open"),
    updatedAt: coerceString(candidate.updated_at, seed.summary.lastRefreshedAt),
    url,
    labels: Array.isArray(candidate.labels)
      ? candidate.labels
          .map((label) => {
            if (!label || typeof label !== "object") return "";
            return coerceString((label as Record<string, unknown>).name);
          })
          .filter(Boolean)
      : [],
  };
}

function useDashboardLive() {
  const [dashboard, setDashboard] = useState(seed);
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [sourceState, setSourceState] = useState<SourceState>({
    openclaw: {
      status: "fallback",
      lastSync: seed.summary.lastRefreshedAt,
      detail: config.openclaw.fallback,
    },
    github: {
      status: "fallback",
      lastSync: seed.summary.lastRefreshedAt,
      detail: config.github.fallback,
    },
  });
  const openclawSocketRef = useRef<WebSocket | null>(null);

  const refreshGithub = useCallback(async () => {
    setSourceState((previous) => ({
      ...previous,
      github: {
        ...previous.github,
        status: "connecting",
        detail: `Fetching live issues from ${config.github.owner}/${config.github.repo}`,
      },
    }));

    try {
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/issues?state=open&per_page=6&sort=updated&direction=desc`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        },
      );

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(`GitHub issues fetch failed (${response.status})`);
      }

      const issues = Array.isArray(payload) ? payload.map(coerceGithubIssue).filter((issue): issue is GitHubIssue => Boolean(issue)) : [];
      setGithubIssues(issues);
      setSourceState((previous) => ({
        ...previous,
        github: {
          status: "connected",
          lastSync: new Date().toISOString(),
          detail: issues.length ? `${issues.length} live issues mirrored` : "No open issues returned",
        },
      }));
    } catch {
      setGithubIssues([]);
      setSourceState((previous) => ({
        ...previous,
        github: {
          status: "fallback",
          lastSync: seed.summary.lastRefreshedAt,
          detail: config.github.fallback,
        },
      }));
    }
  }, []);

  const refreshOpenClaw = useCallback(() => {
    if (typeof window === "undefined" || !("WebSocket" in window)) {
      setSourceState((previous) => ({
        ...previous,
        openclaw: {
          status: "fallback",
          lastSync: seed.summary.lastRefreshedAt,
          detail: config.openclaw.fallback,
        },
      }));
      return;
    }

    if (openclawSocketRef.current) {
      openclawSocketRef.current.close();
      openclawSocketRef.current = null;
    }

    setSourceState((previous) => ({
      ...previous,
      openclaw: {
        ...previous.openclaw,
        status: "connecting",
        detail: `Opening ${config.openclaw.endpoint}`,
      },
    }));

    try {
      const socket = new WebSocket(config.openclaw.endpoint);
      openclawSocketRef.current = socket;

      socket.addEventListener("open", () => {
        setSourceState((previous) => ({
          ...previous,
          openclaw: {
            status: "connected",
            lastSync: new Date().toISOString(),
            detail: "OpenClaw socket live",
          },
        }));
      });

      socket.addEventListener("message", (event) => {
        const raw = typeof event.data === "string" ? safeJsonParse(event.data) : null;
        if (!raw) return;

        const snapshot = coerceDashboardSnapshot(raw);
        if (snapshot) {
          setDashboard((previous) => mergeDashboard(previous, snapshot));
        }

        const payloadSummary = typeof raw === "object" ? Object.keys(raw as Record<string, unknown>).slice(0, 4).join(", ") : "text frame";
        setSourceState((previous) => ({
          ...previous,
          openclaw: {
            status: "connected",
            lastSync: new Date().toISOString(),
            detail: `Telemetry frame: ${payloadSummary}`,
          },
        }));
      });

      socket.addEventListener("close", () => {
        if (openclawSocketRef.current === socket) {
          openclawSocketRef.current = null;
        }

        setSourceState((previous) => ({
          ...previous,
          openclaw: {
            status: "fallback",
            lastSync: previous.openclaw.lastSync,
            detail: config.openclaw.fallback,
          },
        }));
      });

      socket.addEventListener("error", () => {
        setSourceState((previous) => ({
          ...previous,
          openclaw: {
            status: "error",
            lastSync: previous.openclaw.lastSync,
            detail: config.openclaw.fallback,
          },
        }));
      });
    } catch {
      setSourceState((previous) => ({
        ...previous,
        openclaw: {
          status: "error",
          lastSync: previous.openclaw.lastSync,
          detail: config.openclaw.fallback,
        },
      }));
    }
  }, []);

  useEffect(() => {
    void refreshGithub();
    refreshOpenClaw();

    return () => {
      openclawSocketRef.current?.close();
      openclawSocketRef.current = null;
    };
  }, [refreshGithub, refreshOpenClaw]);

  const refreshSource = useCallback(
    (source: SourceKey) => {
      if (source === "github") {
        void refreshGithub();
        return;
      }

      refreshOpenClaw();
    },
    [refreshGithub, refreshOpenClaw],
  );

  return { dashboard, githubIssues, sourceState, refreshSource };
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

function StageCanvas({ workers, selectedAgent, issueCount, liveStatus }: { workers: Worker[]; selectedAgent: string; issueCount: number; liveStatus: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    context.clearRect(0, 0, width, height);
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#020617");
    background.addColorStop(1, "#0f172a");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(255,255,255,0.04)";
    context.fillRect(0, 0, width, 46);

    context.fillStyle = "rgba(34, 211, 238, 0.15)";
    context.fillRect(0, 0, width, 3);

    context.fillStyle = "#e2e8f0";
    context.font = "600 14px ui-sans-serif, system-ui";
    context.fillText("Live stage canvas", 18, 28);

    context.font = "500 11px ui-sans-serif, system-ui";
    context.fillStyle = "#7dd3fc";
    context.fillText(liveStatus, 18, 42);

    const top = 60;
    const bottomPadding = 18;
    const laneHeight = height - top - bottomPadding;
    const laneWidth = (width - 28) / stageOrder.length;
    const bandHeight = laneHeight - 10;

    stageOrder.forEach((stage, index) => {
      const laneX = 14 + index * laneWidth;
      const laneY = top;
      const laneWorkers = workers.filter((worker) => stageFor(worker) === stage);
      const laneGradient = context.createLinearGradient(laneX, laneY, laneX, laneY + bandHeight);
      laneGradient.addColorStop(0, "rgba(255,255,255,0.05)");
      laneGradient.addColorStop(1, "rgba(255,255,255,0.02)");
      context.fillStyle = laneGradient;
      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = 1;
      roundRect(context, laneX, laneY, laneWidth - 8, bandHeight, 18);
      context.fill();
      context.stroke();

      context.fillStyle = "rgba(148,163,184,0.9)";
      context.font = "600 11px ui-sans-serif, system-ui";
      context.fillText(stageLabels[stage], laneX + 14, laneY + 22);
      context.fillStyle = "rgba(148,163,184,0.7)";
      context.font = "500 10px ui-sans-serif, system-ui";
      context.fillText(`${laneWorkers.length} workers`, laneX + 14, laneY + 38);

      const nodeHeight = 38;
      const nodeGap = 10;
      const stackHeight = laneWorkers.length ? laneWorkers.length * nodeHeight + (laneWorkers.length - 1) * nodeGap : 0;
      const startY = laneY + Math.max(58, (bandHeight - stackHeight) / 2);

      laneWorkers.forEach((worker, workerIndex) => {
        const x = laneX + 14;
        const y = startY + workerIndex * (nodeHeight + nodeGap);
        const nodeWidth = laneWidth - 36;
        const palette = riskFill[worker.riskFlag];
        const selected = worker.agent === selectedAgent;

        if (selected) {
          context.save();
          context.shadowColor = "rgba(34, 211, 238, 0.45)";
          context.shadowBlur = 20;
          context.fillStyle = "rgba(34, 211, 238, 0.12)";
          roundRect(context, x - 2, y - 2, nodeWidth + 4, nodeHeight + 4, 14);
          context.fill();
          context.restore();
        }

        context.fillStyle = selected ? "rgba(8, 47, 73, 0.92)" : "rgba(15, 23, 42, 0.92)";
        context.strokeStyle = selected ? "rgba(103, 232, 249, 0.85)" : palette.stroke;
        context.lineWidth = 1;
        roundRect(context, x, y, nodeWidth, nodeHeight, 14);
        context.fill();
        context.stroke();

        context.fillStyle = palette.fill;
        roundRect(context, x + 10, y + 10, 18, 18, 9);
        context.fill();

        context.fillStyle = palette.text;
        context.font = "700 9px ui-sans-serif, system-ui";
        context.fillText(worker.agent.slice(0, 1).toUpperCase(), x + 15, y + 23);

        context.fillStyle = "#f8fafc";
        context.font = "600 11px ui-sans-serif, system-ui";
        context.fillText(worker.agent, x + 36, y + 17);
        context.fillStyle = "#cbd5e1";
        context.font = "500 10px ui-sans-serif, system-ui";
        context.fillText(worker.currentIssue, x + 36, y + 31);
      });
    });

    const footY = height - 18;
    context.fillStyle = "rgba(148,163,184,0.7)";
    context.font = "500 10px ui-sans-serif, system-ui";
    context.fillText(`${issueCount} live GitHub issues mirrored`, 18, footY);
  }, [workers, selectedAgent, issueCount, liveStatus]);

  return <canvas ref={canvasRef} className="h-[340px] w-full rounded-2xl border border-white/10 bg-slate-950/90" />;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

export default function Home() {
  const { dashboard, githubIssues, sourceState, refreshSource } = useDashboardLive();
  const [selectedAgent, setSelectedAgent] = useState(dashboard.workers[0]?.agent ?? "");

  const activeAgent = dashboard.workers.some((worker) => worker.agent === selectedAgent)
    ? selectedAgent
    : dashboard.workers[0]?.agent ?? "";
  const selectedWorker = dashboard.workers.find((worker) => worker.agent === activeAgent) ?? dashboard.workers[0];

  const summaryCards = useMemo(
    () => [
      { label: "Active workers", value: dashboard.summary.activeWorkers, accent: "text-cyan-200" },
      { label: "Attention needed", value: dashboard.summary.attentionNeeded, accent: "text-amber-200" },
      { label: "Blocked workers", value: dashboard.summary.blockedWorkers, accent: "text-rose-200" },
      { label: "Last refreshed", value: dashboard.summary.lastRefreshedAt, accent: "text-white" },
    ],
    [dashboard.summary],
  );

  const sourceCards = [
    {
      key: "openclaw" as const,
      label: config.openclaw.label,
      endpoint: config.openclaw.endpoint,
      fallback: config.openclaw.fallback,
      note: config.openclaw.note,
      lastSync: sourceState.openclaw.lastSync,
      status: sourceState.openclaw.status,
      detail: sourceState.openclaw.detail,
    },
    {
      key: "github" as const,
      label: config.github.label,
      endpoint: `${config.github.owner}/${config.github.repo}`,
      fallback: config.github.fallback,
      note: config.github.note,
      lastSync: sourceState.github.lastSync,
      status: sourceState.github.status,
      detail: sourceState.github.detail,
    },
  ];

  const stageBuckets = stageOrder.map((stage) => ({
    stage,
    workers: dashboard.workers.filter((worker) => stageFor(worker) === stage),
  }));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">bob-sec dashboard v2a</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Live ops shell, now wired for source refresh</h1>
              <p className="mt-2 max-w-4xl text-sm text-slate-300">
                V2A keeps the V1 utility, adds client-side refresh for OpenClaw telemetry and GitHub issues, and pairs the operator table with a canvas lane view for the next sprite pass.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Generated at {dashboard.generatedAt}
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
                  <RefreshButton
                    onClick={() => refreshSource(source.key)}
                    label={source.key === "openclaw" ? "Reconnect telemetry" : "Refresh issues"}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <SourceStat label="Connection" value={source.status} tone={statusTone[source.status] ?? statusTone.fallback} />
                <SourceStat label="Endpoint" value={source.endpoint} tone="bg-slate-500/15 text-slate-200 ring-slate-400/25" />
                <SourceStat label="Last sync" value={toDisplayTime(source.lastSync)} tone="bg-cyan-500/15 text-cyan-200 ring-cyan-400/25" />
                <SourceStat label="Fallback" value={source.fallback} tone="bg-amber-500/15 text-amber-200 ring-amber-400/25" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                {source.detail}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel eyebrow="Sprite layer" title="Live work canvas">
            <p className="mb-4 max-w-3xl text-sm text-slate-400">
              The canvas mirrors the worker lanes, keeps the layout read-friendly, and gives the next sprite layer a home without displacing the table.
            </p>
            <StageCanvas
              workers={dashboard.workers}
              selectedAgent={selectedWorker?.agent ?? ""}
              issueCount={githubIssues.length}
              liveStatus={`${sourceState.openclaw.status} · ${sourceState.github.status}`}
            />
          </Panel>

          <Panel eyebrow="GitHub mirror" title="Live issue feed">
            <div className="space-y-3">
              {githubIssues.length ? (
                githubIssues.map((issue) => (
                  <a
                    key={issue.number}
                    href={issue.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">#{issue.number}</p>
                        <h3 className="mt-1 text-sm font-semibold text-white">{issue.title}</h3>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusTone.connected}`}>
                        {issue.state}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{toDisplayTime(issue.updatedAt)}</span>
                      {issue.labels.length ? <span>· {issue.labels.join(", ")}</span> : null}
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                  {sourceState.github.detail}
                </div>
              )}
            </div>
          </Panel>
        </section>

        <Panel eyebrow="Stage board" title="Sprite-ready workflow lanes">
          <p className="mb-4 max-w-4xl text-sm text-slate-400">
            This is the first V2 stage map. It keeps the operator view readable, maps workers into lanes, and leaves room for a sprite or canvas layer later without replacing the table.
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
                  {dashboard.workers.map((worker) => {
                    const isSelected = worker.agent === selectedWorker?.agent;
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
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusTone[worker.status] ?? statusTone.fallback}`}
                          >
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{toDisplayTime(worker.lastUpdate)}</td>
                        <td className="px-3 py-3 text-slate-300">{worker.lastCommit}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${riskTone[worker.riskFlag]}`}>
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
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedWorker?.agent ?? "n/a"}</h2>
                <p className="text-sm text-cyan-300">{selectedWorker?.role ?? "n/a"}</p>
              </div>
              {selectedWorker ? (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${riskTone[selectedWorker.riskFlag]}`}>
                  {selectedWorker.riskFlag}
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-5">
              {selectedWorker ? (
                <>
                  <Detail label="Stage lane" value={stageLabels[stageFor(selectedWorker)]} />
                  <Detail label="Issue" value={`${selectedWorker.currentIssue} · ${selectedWorker.detail.issue}`} />
                  <Detail label="Update" value={selectedWorker.detail.update} />
                  <Detail label="Commit" value={selectedWorker.detail.commit} />
                  <Detail label="Blocker" value={selectedWorker.detail.blocker} />
                  <Detail label="Routing context" value={selectedWorker.detail.routingContext} />
                  <Detail label="Target channel" value={selectedWorker.targetChannel} />
                </>
              ) : (
                <p className="text-sm text-slate-400">No worker selected.</p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
