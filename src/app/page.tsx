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

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
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
      <main className="min-h-screen px-4 py-12" style={{ background: "#080808" }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setResult(null)}
            className="mb-10 flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-300 transition-colors duration-150 group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-150">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New analysis
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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Top violet glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-xl flex flex-col gap-10">
        {/* Badge */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border"
            style={{
              background: "rgba(139,92,246,0.08)",
              borderColor: "rgba(139,92,246,0.25)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Gen 3 Code Collaboration
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3">
            <h1
              className="text-6xl sm:text-7xl font-bold tracking-tight leading-none"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 40%, #6d28d9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Intent
              </span>
              <span className="text-white"> Diff</span>
            </h1>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight leading-none text-zinc-400">
              Viewer
            </p>
          </div>

          <p className="text-[15px] text-zinc-500 leading-relaxed max-w-sm">
            Git shows <em className="text-zinc-400 not-italic">what</em> changed.
            We show <span className="text-violet-400 font-medium">why</span>.
            Paste a PR URL and the AI prompt behind it.
          </p>
        </div>

        {/* Form card with gradient border */}
        <div
          className="rounded-2xl p-px"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(255,255,255,0.06) 50%, rgba(139,92,246,0.15) 100%)",
          }}
        >
          <div className="rounded-2xl p-7 flex flex-col gap-5" style={{ background: "#0e0e0e" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="pr-url" className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase">
                  GitHub PR URL
                </label>
                <input
                  id="pr-url"
                  type="url"
                  placeholder="https://github.com/owner/repo/pull/123"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ai-prompt" className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase">
                  AI Prompt
                </label>
                <textarea
                  id="ai-prompt"
                  placeholder="What did you ask the AI to build or fix?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-150 disabled:opacity-50 leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm text-red-400"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!prUrl.trim() || !aiPrompt.trim() || loading}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 16px rgba(109,40,217,0.3)",
                }}
                onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.filter = "none"; }}
              >
                {loading ? (
                  <><SpinnerIcon /> Analyzing…</>
                ) : (
                  "Analyze →"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-zinc-700">
          <a
            href="https://github.com/adam9939334-lgtm/intent-diff-viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors duration-150"
          >
            <GitHubIcon />
            Open source
          </a>
          <span>·</span>
          <span>Built for the AI generation</span>
        </div>
      </div>
    </main>
  );
}
