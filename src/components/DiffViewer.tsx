"use client";

import { useState, useEffect } from "react";
import { PatchDiff } from "@pierre/diffs/react";

interface DiffFile {
  filename: string;
  patch: string | undefined;
  additions: number;
  deletions: number;
}

export interface CheckpointIntent {
  goal: string;
  constraints: string;
  riskAreas: string;
}

interface DiffViewerProps {
  title: string;
  description: string;
  files: DiffFile[];
  intent: CheckpointIntent;
  shareUrl?: string;
}

function getFileSegments(filename: string): { dir: string; base: string } {
  const parts = filename.split("/");
  const base = parts.pop() ?? filename;
  const dir = parts.length > 0 ? parts.join("/") + "/" : "";
  return { dir, base };
}

// PatchDiff requires a full unified diff with file headers
function buildFullPatch(filename: string, patch: string): string {
  return `--- a/${filename}\n+++ b/${filename}\n${patch}`;
}

function FileCard({ file }: { file: DiffFile }) {
  const defaultOpen = file.additions + file.deletions <= 50;
  const [open, setOpen] = useState(defaultOpen);
  const { dir, base } = getFileSegments(file.filename);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors duration-150"
        style={{ background: "rgba(255,255,255,0.02)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-3 h-3 text-zinc-600 flex-shrink-0 transition-transform duration-200"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-xs min-w-0 truncate">
            {dir && <span className="text-zinc-600">{dir}</span>}
            <span className="text-zinc-200 font-medium">{base}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {file.additions > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 tabular-nums">+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span className="text-[10px] font-mono text-red-400 tabular-nums">-{file.deletions}</span>
          )}
        </div>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {file.patch ? (
            <div className="overflow-x-auto text-xs">
              <PatchDiff
                patch={buildFullPatch(file.filename, file.patch)}
                options={{ theme: "github-dark", disableFileHeader: true }}
              />
            </div>
          ) : (
            <p className="px-4 py-4 text-xs text-zinc-700 italic">Binary file or no diff available.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 text-xs font-mono transition-colors duration-150"
      style={{ color: copied ? "#a3e635" : "rgb(113 113 122)" }}
    >
      <span>{copied ? "✓" : "⎘"}</span>
      <span>{copied ? "copied" : "copy share link"}</span>
    </button>
  );
}

export default function DiffViewer({ title, description, files, intent, shareUrl }: DiffViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Review Checkpoint card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(163,230,53,0.2)",
          background: "rgba(163,230,53,0.03)",
          borderLeft: "3px solid #a3e635",
        }}
      >
        <div className="px-5 pt-4 pb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-lime-400 uppercase font-semibold">
              Review Checkpoint
            </span>
            <span className="text-zinc-800 text-xs">·</span>
            <span className="text-[10px] text-zinc-600 font-mono">structured intent for this PR</span>
          </div>
          {shareUrl && mounted && <CopyButton url={shareUrl} />}
        </div>
        <div className="px-5 pb-5 flex flex-col gap-4 mt-2">
          <div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">Goal</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{intent.goal}</p>
          </div>
          {intent.constraints && (
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">Constraints</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{intent.constraints}</p>
            </div>
          )}
          {intent.riskAreas && (
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">Risk Areas</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(251,191,36,0.8)" }}>{intent.riskAreas}</p>
            </div>
          )}
        </div>
      </div>

      {/* PR metadata */}
      <div
        className="rounded-xl px-5 py-4 flex flex-col gap-3"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
      >
        <h2 className="text-base font-semibold text-white leading-snug">{title}</h2>
        {description && (
          <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {totalAdditions > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              +{totalAdditions}
            </span>
          )}
          {totalDeletions > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-red-400 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              -{totalDeletions}
            </span>
          )}
          <span
            className="text-[11px] font-mono text-zinc-600 px-2 py-0.5 rounded-md"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* File diffs */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase px-1">
          Changed Files
        </p>
        {mounted ? (
          files.map((file) => <FileCard key={file.filename} file={file} />)
        ) : (
          files.map((file) => {
            const { dir, base } = getFileSegments(file.filename);
            return (
              <div key={file.filename} className="rounded-xl px-4 py-3" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="font-mono text-xs">
                  {dir && <span className="text-zinc-600">{dir}</span>}
                  <span className="text-zinc-300 font-medium">{base}</span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
