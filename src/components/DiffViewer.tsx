"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function DiffLine({ line }: { line: string }) {
  if (line.startsWith("+")) {
    return (
      <div className="bg-green-950/60 text-green-300 px-3 py-0.5 whitespace-pre font-mono text-xs leading-5">
        {line}
      </div>
    );
  }
  if (line.startsWith("-")) {
    return (
      <div className="bg-red-950/60 text-red-300 px-3 py-0.5 whitespace-pre font-mono text-xs leading-5">
        {line}
      </div>
    );
  }
  if (line.startsWith("@@")) {
    return (
      <div className="bg-blue-950/40 text-blue-400 px-3 py-0.5 whitespace-pre font-mono text-xs leading-5">
        {line}
      </div>
    );
  }
  return (
    <div className="text-muted-foreground px-3 py-0.5 whitespace-pre font-mono text-xs leading-5">
      {line}
    </div>
  );
}

function FileCard({ file }: { file: DiffFile }) {
  const [open, setOpen] = useState(true);
  const lines = file.patch ? file.patch.split("\n") : [];

  return (
    <Card className="border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left"
      >
        <CardHeader className="border-b border-border py-3 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-mono font-medium text-foreground truncate">
              {file.filename}
            </CardTitle>
            <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
              <span className="text-green-400">+{file.additions}</span>
              <span className="text-red-400">-{file.deletions}</span>
              <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
            </div>
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="p-0">
          {lines.length > 0 ? (
            <div className="overflow-x-auto">
              {lines.map((line, i) => (
                <DiffLine key={i} line={line} />
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-xs text-muted-foreground italic">
              No patch available for this file (binary or too large).
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function DiffViewer({ title, description, files, prompt }: DiffViewerProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* AI Intent card */}
      <Card className="border-violet-500/40 bg-card shadow-lg">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-500" />
            <CardTitle className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
              AI Intent
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{prompt}</p>
        </CardContent>
      </Card>

      {/* PR summary card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        {description && (
          <CardContent className="pt-3">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
          </CardContent>
        )}
      </Card>

      {/* File diffs */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {files.length} file{files.length !== 1 ? "s" : ""} changed
        </p>
        {files.map((file) => (
          <FileCard key={file.filename} file={file} />
        ))}
      </div>
    </div>
  );
}
