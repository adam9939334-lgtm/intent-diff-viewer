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
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setResult(data as AnalyzeResult);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen px-6 py-12" style={{ background: "#060606", fontFamily: "var(--font-mono)" }}>
        {/* Grain */}
        <div className="pointer-events-none fixed inset-0 z-50" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.025,
        }} />
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setResult(null)}
            className="mb-12 flex items-center gap-3 text-xs text-zinc-600 hover:text-lime-400 transition-colors group"
          >
            <span className="text-lime-400">←</span>
            <span className="tracking-widest uppercase">new analysis</span>
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
      className="min-h-screen relative"
      style={{ background: "#060606", fontFamily: "var(--font-mono)" }}
    >
      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-50" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
        opacity: 0.025,
      }} />

      <div className="max-w-2xl mx-auto px-6 min-h-screen flex flex-col py-16">

        {/* Top bar */}
        <header className="flex items-center justify-between mb-20">
          <span className="text-[11px] text-zinc-700 tracking-widest">
            // intent-diff-viewer v0.1.0
          </span>
          <a
            href="https://github.com/adam9939334-lgtm/intent-diff-viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-700 hover:text-lime-400 transition-colors tracking-widest"
          >
            github ↗
          </a>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">

          {/* Eyebrow */}
          <p className="text-[10px] tracking-[0.3em] text-zinc-700 uppercase mb-8">
            The missing context layer
          </p>

          {/* Headline — Instrument Serif italic, big */}
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-[clamp(52px,8vw,80px)] leading-[0.88] text-white mb-3 tracking-tight">
            You wrote<br />the prompt.
          </h1>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-[clamp(52px,8vw,80px)] leading-[0.88] tracking-tight mb-14"
            // fading out the second line
            >
            <span style={{ color: "#3f3f3f" }}>Don't forget</span>{" "}
            <span style={{ color: "#a3e635" }}>why.</span>
          </h2>

          {/* Divider */}
          <div className="border-t border-zinc-900 mb-12" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* PR URL */}
            <div className="flex gap-4 items-start">
              <span className="text-lime-400 text-sm mt-[14px] select-none flex-shrink-0">›</span>
              <div className="flex-1">
                <label
                  htmlFor="pr-url"
                  className="block text-[10px] tracking-[0.25em] text-zinc-600 uppercase mb-2"
                >
                  GitHub PR URL
                </label>
                <input
                  id="pr-url"
                  type="url"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  disabled={loading}
                  placeholder="https://github.com/owner/repo/pull/123"
                  className="w-full bg-transparent border-b border-zinc-800 text-sm text-white placeholder-zinc-800 outline-none py-2 transition-colors duration-150 disabled:opacity-40"
                  style={{ fontFamily: "var(--font-mono)" }}
                  onFocus={(e) => { e.target.style.borderColor = "#a3e635"; }}
                  onBlur={(e) => { e.target.style.borderColor = ""; }}
                />
              </div>
            </div>

            {/* AI Prompt */}
            <div className="flex gap-4 items-start">
              <span className="text-lime-400 text-sm mt-[14px] select-none flex-shrink-0">›</span>
              <div className="flex-1">
                <label
                  htmlFor="ai-prompt"
                  className="block text-[10px] tracking-[0.25em] text-zinc-600 uppercase mb-2"
                >
                  AI Prompt
                </label>
                <textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={loading}
                  placeholder="What did you ask the AI to build or fix?"
                  rows={2}
                  className="w-full bg-transparent border-b border-zinc-800 text-sm text-white placeholder-zinc-800 outline-none py-2 resize-none transition-colors duration-150 disabled:opacity-40 leading-relaxed"
                  style={{ fontFamily: "var(--font-mono)" }}
                  onFocus={(e) => { e.target.style.borderColor = "#a3e635"; }}
                  onBlur={(e) => { e.target.style.borderColor = ""; }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="ml-8 text-xs text-red-500 border-l-2 border-red-500 pl-3">
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-900" />

            {/* Submit */}
            <button
              type="submit"
              disabled={!prUrl.trim() || !aiPrompt.trim() || loading}
              className="flex items-center gap-3 text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 group text-left"
            >
              <span className="text-lime-400 group-hover:text-lime-300 transition-colors">$</span>
              <span className="tracking-wide">
                {loading ? "analyzing..." : "analyze"}
              </span>
              <span className="flex-1 border-b border-dashed border-zinc-900 group-hover:border-lime-400/20 transition-colors" />
              <span className="text-zinc-800 group-hover:text-lime-400/60 transition-colors text-xs">
                {loading ? "⟳" : "↵"}
              </span>
            </button>

          </form>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-[10px] text-zinc-800 tracking-widest">
            open source · built for the AI generation
          </span>
          <span className="text-[10px] text-zinc-800">2026</span>
        </footer>

      </div>
    </main>
  );
}
