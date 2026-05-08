"use client";

import { useState, useEffect } from "react";
import { PatchDiff } from "@pierre/diffs/react";

interface DiffFile {
  filename: string;
  patch: string | undefined;
  additions: number;
  deletions: number;
}

interface DiffViewerProps {
  title: string;
  description: string;
  files: DiffFile[];
  prompt: string;
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

export default function DiffViewer({ title, description, files, prompt }: DiffViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Intent card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(139,92,246,0.25)",
          background: "rgba(139,92,246,0.04)",
          borderLeft: "3px solid rgba(139,92,246,0.7)",
        }}
      >
        <div className="px-5 pt-4 pb-1 flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-semibold">
            AI Intent
          </span>
          <span className="text-zinc-800 text-xs">·</span>
          <span className="text-[10px] text-zinc-600 font-mono">the why behind this PR</span>
        </div>
        <div className="px-5 pb-5">
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{prompt}</p>
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
