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

function totalChanges(file: DiffFile): number {
  return file.additions + file.deletions;
}

function FileCard({ file }: { file: DiffFile }) {
  const defaultOpen = totalChanges(file) <= 50;
  const [open, setOpen] = useState(defaultOpen);
  const { dir, base } = getFileSegments(file.filename);

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden transition-all duration-200">
      {/* File header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-900/60 transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`w-3.5 h-3.5 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"}`}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-mono text-xs min-w-0">
            {dir && <span className="text-zinc-500">{dir}</span>}
            <span className="text-zinc-200 font-semibold">{base}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {file.additions > 0 && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full">
              +{file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span className="text-[11px] font-mono text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-full">
              -{file.deletions}
            </span>
          )}
        </div>
      </button>

      {/* Diff content */}
      {open && (
        <div className="border-t border-zinc-800">
          {file.patch ? (
            <div className="overflow-x-auto">
              <PatchDiff
                patch={file.patch}
                options={{
                  theme: "github-dark",
                  disableFileHeader: true,
                }}
              />
            </div>
          ) : (
            <p className="px-4 py-4 text-xs text-zinc-600 italic">
              Binary file or no changes to display.
            </p>
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
    <div className="flex flex-col gap-6 w-full">
      {/* Intent card — the WHY */}
      <div
        className="rounded-xl border border-zinc-800 overflow-hidden"
        style={{ borderLeftColor: "rgb(124,58,237)", borderLeftWidth: "3px" }}
      >
        <div className="px-6 pt-5 pb-2 flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.18em] text-violet-400 uppercase font-semibold">
            AI Intent
          </span>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-[10px] text-zinc-600 font-mono">the why</span>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {prompt}
          </p>
        </div>
      </div>

      {/* PR header */}
      <div className="rounded-xl border border-zinc-800 px-6 py-5 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white leading-snug">{title}</h2>
        {description && (
          <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{description}</p>
        )}
        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {totalAdditions > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1 rounded-full">
              <span>+{totalAdditions}</span>
              <span className="text-emerald-700">additions</span>
            </span>
          )}
          {totalDeletions > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-red-400 bg-red-950/30 border border-red-900/40 px-2.5 py-1 rounded-full">
              <span>-{totalDeletions}</span>
              <span className="text-red-700">deletions</span>
            </span>
          )}
          <span className="inline-flex items-center text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
            {files.length} file{files.length !== 1 ? "s" : ""} changed
          </span>
        </div>
      </div>

      {/* File diffs */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-600 uppercase mb-1">
          Changed Files
        </p>
        {mounted ? (
          files.map((file) => <FileCard key={file.filename} file={file} />)
        ) : (
          // SSR placeholder to avoid hydration mismatch with web components
          files.map((file) => {
            const { dir, base } = getFileSegments(file.filename);
            return (
              <div key={file.filename} className="rounded-lg border border-zinc-800 px-4 py-3">
                <span className="font-mono text-xs">
                  {dir && <span className="text-zinc-500">{dir}</span>}
                  <span className="text-zinc-200 font-semibold">{base}</span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
