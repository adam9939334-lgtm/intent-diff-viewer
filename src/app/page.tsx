"use client";

import { useState } from "react";
import DiffViewer from "@/components/DiffViewer";

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
  prompt: string;
}

export default function Home() {
  const [prUrl, setPrUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, prompt: aiPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as AnalyzeResult);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setResult(null)}
            className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <DiffViewer
            title={result.title}
            description={result.description}
            files={result.files}
            prompt={result.prompt}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-2xl flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
              Gen 3 Code Collaboration
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-none">
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Intent
            </span>{" "}
            Diff Viewer
          </h1>

          <p className="text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Paste a GitHub PR URL and the prompt that generated the code.
            See the <span className="text-violet-400 font-medium">why</span> behind every change.
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-xl border border-zinc-800 p-8 flex flex-col gap-6"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* PR URL */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="pr-url"
                className="text-xs font-medium text-zinc-400 tracking-wide uppercase"
              >
                GitHub PR URL
              </label>
              <input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-all duration-150 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              />
            </div>

            {/* AI Prompt */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="ai-prompt"
                className="text-xs font-medium text-zinc-400 tracking-wide uppercase"
              >
                AI Prompt
              </label>
              <textarea
                id="ai-prompt"
                placeholder="Describe what you asked the AI to build..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-150 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 leading-relaxed"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!prUrl.trim() || !aiPrompt.trim() || loading}
              className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white/70"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze{" "}
                  <span className="opacity-60" aria-hidden>
                    →
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600">
          Open source &middot; Built for the AI generation &middot;{" "}
          <a
            href="https://github.com/adam9939334-lgtm/intent-diff-viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-violet-400 transition-colors duration-150"
          >
            github.com/adam9939334-lgtm/intent-diff-viewer
          </a>
        </p>
      </div>
    </main>
  );
}
