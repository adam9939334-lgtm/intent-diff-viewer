"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [prUrl, setPrUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16 bg-background">
      <div className="w-full max-w-2xl flex flex-col gap-10">
        <div className="flex flex-col gap-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              Gen 3 Code Collaboration
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Intent Diff Viewer
          </h1>
          <p className="text-lg text-muted-foreground">
            See the <span className="text-violet-400 font-medium">why</span>{" "}
            behind every AI-generated change
          </p>
        </div>

        <Card className="border-border bg-card shadow-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Analyze a Pull Request
            </CardTitle>
            <CardDescription>
              Paste the PR URL and the prompt that produced the code to get
              intent-annotated diffs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pr-url">GitHub PR URL</Label>
              <Input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ai-prompt">AI Prompt used</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Describe the prompt or instruction you gave the AI model that generated this code…"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="resize-none text-sm"
              />
            </div>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
              disabled={!prUrl.trim() || !aiPrompt.trim()}
            >
              Analyze
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Diff rendering and intent annotations coming in Phase 2.
        </p>
      </div>
    </main>
  );
}
