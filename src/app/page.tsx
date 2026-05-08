"use client";

import { useState } from "react";
import DiffViewer, { CheckpointIntent } from "@/components/DiffViewer";

interface DiffFile {
  filename: string;
  patch: string | undefined;
  additions: number;
  deletions: number;
}

interface AnalyzeResult {
  title: string;
  description: string;
  files: DiffFile[];
  intent: CheckpointIntent;
}

function generateShareUrl(prUrl: string, intent: CheckpointIntent): string {
  const data = btoa(JSON.stringify(intent));
  const params = new URLSearchParams({ pr: prUrl, data });
  return `${window.location.origin}/view?${params.toString()}`;
}

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")";

export default function Home() {
  const [prUrl, setPrUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("");
  const [riskAreas, setRiskAreas] = useState("");
  const [loading, setLoading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [lastAutofillUrl, setLastAutofillUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");

  async function tryAutofill(url: string) {
    if (!url.match(/github\.com\/[^/]+\/[^/]+\/pull\/\d+/)) return;
    if (url === lastAutofillUrl) return;
    setAutofilling(true);
    try {
      const res = await fetch(`/api/pr-meta?url=${encodeURIComponent(url)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.goal) {
        setGoal(data.goal);
        setConstraints(data.constraints ?? "");
        setRiskAreas(data.riskAreas ?? "");
        setAutofilled(true);
        setLastAutofillUrl(url);
      }
    } finally {
      setAutofilling(false);
    }
  }

  function handlePrUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    setPrUrl(url);
    if (autofilled && url !== lastAutofillUrl) {
      setAutofilled(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, goal, constraints, riskAreas }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setResult(data as AnalyzeResult);
      setShareUrl(generateShareUrl(prUrl, { goal, constraints, riskAreas }));
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen px-6 py-12" style={{ background: "#060606", fontFamily: "var(--font-mono)" }}>
        <div className="pointer-events-none fixed inset-0 z-50" style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat", backgroundSize: "128px 128px", opacity: 0.025,
        }} />
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setResult(null)}
            className="mb-12 flex items-center gap-3 text-sm text-zinc-500 hover:text-lime-400 transition-colors group">
            <span className="text-lime-400">←</span>
            <span className="tracking-widest uppercase text-xs">new checkpoint</span>
          </button>
          <DiffViewer
            title={result.title}
            description={result.description}
            files={result.files}
            intent={result.intent}
            shareUrl={shareUrl}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative" style={{ background: "#060606", fontFamily: "var(--font-mono)" }}>
      {/* Grain */}
      <div className="pointer-events-none fixed inset-0 z-50" style={{
        backgroundImage: GRAIN,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px", opacity: 0.025,
      }} />
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 35% at 50% -5%, rgba(163,230,53,0.06) 0%, transparent 70%)",
      }} />

      <div className="max-w-2xl mx-auto px-6 min-h-screen flex flex-col py-14">

        {/* Top bar */}
        <header className="flex items-center justify-between mb-16">
          <span className="text-xs text-zinc-500">// intent-diff-viewer</span>
          <a href="https://github.com/adam9939334-lgtm/intent-diff-viewer"
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-lime-400 transition-colors">
            github ↗
          </a>
        </header>

        <div className="flex-1 flex flex-col justify-center">

          {/* Badge */}
          <div className="mb-8 inline-flex">
            <span className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              Gen 3 code review
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-[clamp(48px,7vw,72px)] leading-[0.9] text-white mb-2 tracking-tight">
            AI wrote<br />the PR.
          </h1>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-[clamp(48px,7vw,72px)] leading-[0.9] tracking-tight mb-6">
            <span className="text-zinc-600">Help your team</span>{" "}
            <span style={{ color: "#a3e635" }}>review it.</span>
          </h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 mb-12 leading-relaxed max-w-md">
            Create a <span style={{ color: "#a3e635" }}>Review Checkpoint</span> — goal, constraints, and risk areas
            alongside the diff. Stop reviewing AI code blind.
          </p>

          {/* Divider */}
          <div className="border-t border-zinc-800 mb-10" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">

            {/* PR URL */}
            <div>
              <label htmlFor="pr-url" className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase">
                › GitHub PR URL
              </label>
              <input
                id="pr-url" type="url" value={prUrl}
                onChange={handlePrUrlChange}
                disabled={loading}
                placeholder="https://github.com/owner/repo/pull/123"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)" }}
                onFocus={(e) => { e.target.style.borderColor = "#a3e635"; e.target.style.boxShadow = "0 0 0 1px rgba(163,230,53,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; tryAutofill(prUrl); }}
                onPaste={(e) => { const pasted = e.clipboardData.getData("text"); setTimeout(() => tryAutofill(pasted), 0); }}
              />
              {autofilling && (
                <p className="mt-1.5 text-[11px] text-zinc-600 font-mono">parsing PR description...</p>
              )}
            </div>

            {/* Goal */}
            <div>
              <label htmlFor="goal" className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase flex items-center gap-2">
                › Goal <span className="text-zinc-700 normal-case tracking-normal">— what was the agent trying to accomplish?</span>
                {autofilled && <span className="text-[10px] text-lime-600 font-mono normal-case tracking-normal">auto-filled from PR</span>}
              </label>
              <textarea
                id="goal" value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={loading}
                placeholder="e.g. Refactor auth middleware to use JWT and remove session cookies"
                rows={2}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-40 resize-none leading-relaxed"
                style={{ fontFamily: "var(--font-mono)" }}
                onFocus={(e) => { e.target.style.borderColor = "#a3e635"; e.target.style.boxShadow = "0 0 0 1px rgba(163,230,53,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              />
            </div>

            {/* Constraints */}
            <div>
              <label htmlFor="constraints" className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase">
                › Constraints <span className="text-zinc-700 normal-case tracking-normal">— optional</span>
              </label>
              <textarea
                id="constraints" value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                disabled={loading}
                placeholder="e.g. Must stay backward-compatible. No new dependencies. Keep existing API surface."
                rows={2}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-40 resize-none leading-relaxed"
                style={{ fontFamily: "var(--font-mono)" }}
                onFocus={(e) => { e.target.style.borderColor = "#a3e635"; e.target.style.boxShadow = "0 0 0 1px rgba(163,230,53,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              />
            </div>

            {/* Risk Areas */}
            <div>
              <label htmlFor="risk-areas" className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase">
                › Risk Areas <span className="text-zinc-700 normal-case tracking-normal">— optional</span>
              </label>
              <textarea
                id="risk-areas" value={riskAreas}
                onChange={(e) => setRiskAreas(e.target.value)}
                disabled={loading}
                placeholder="e.g. Token expiry edge cases. The logout flow was rewritten — check for session leaks."
                rows={2}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-40 resize-none leading-relaxed"
                style={{ fontFamily: "var(--font-mono)" }}
                onFocus={(e) => { e.target.style.borderColor = "#a3e635"; e.target.style.boxShadow = "0 0 0 1px rgba(163,230,53,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 border-l-2 border-red-500 pl-3 py-1">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!prUrl.trim() || !goal.trim() || loading}
              className="flex items-center gap-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 group text-left w-full"
              style={{ color: loading ? "#a3e635" : undefined }}
            >
              <span className="text-lime-400">$</span>
              <span className="text-zinc-200 group-hover:text-lime-400 transition-colors font-medium">
                {loading ? "creating checkpoint..." : "create checkpoint"}
              </span>
              <span className="flex-1 border-b border-dashed border-zinc-800 group-hover:border-lime-400/30 transition-colors" />
              <span className="text-zinc-600 group-hover:text-lime-400 transition-colors text-xs">
                {loading ? "⟳" : "↵ enter"}
              </span>
            </button>

          </form>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-xs text-zinc-600">Open source · Built for the AI generation</span>
          <span className="text-xs text-zinc-700">2026</span>
        </footer>

      </div>
    </main>
  );
}
