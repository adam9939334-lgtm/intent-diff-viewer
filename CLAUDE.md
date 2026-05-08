@AGENTS.md

# Intent Diff Viewer

A Next.js web app where developers paste a GitHub PR URL and the AI prompt that generated the code, and see the diff annotated with intent. Think "GitHub PR view with AI context overlaid."

This is Phase 1 of a Gen 3 code collaboration platform.

## Stack

- **Framework**: Next.js 14 (App Router, `src/` directory layout)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (components live in `src/components/ui/`)
- **GitHub API**: `@octokit/rest` for fetching PR data
- **Diff rendering**: Planned — `@pierre/diffs` in Phase 2

## Project Structure

```
src/
  app/
    layout.tsx      — root layout, dark mode enabled globally via `class="dark"`
    page.tsx        — home page: PR URL + AI prompt form
    globals.css     — Tailwind + shadcn CSS variables
  components/
    ui/             — shadcn/ui primitive components
  lib/
    utils.ts        — cn() helper from shadcn
```

## What We're Building

Phase 1 — UI shell:
- Dark-themed landing page with "Intent Diff Viewer" heading
- Two inputs: GitHub PR URL and AI Prompt
- Disabled "Analyze" button until both fields are filled

Phase 2 — Core functionality:
- Fetch PR diff via GitHub API (`@octokit/rest`)
- Parse and render unified diff with syntax highlighting
- Overlay AI intent annotations alongside changed hunks

Phase 3 — Collaboration:
- Share annotated diffs via URL
- Inline comments tied to intent context
- Team workspace / history

## Development

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Key Conventions

- All styling via Tailwind utility classes — no CSS modules
- Dark mode is force-enabled via the `dark` class on `<html>` (no toggle yet)
- shadcn components are added with `npx shadcn@latest add <component>`
- Client components that use state must include `"use client"` at top of file
- Lime (`#a3e635`) is the brand accent color

## Review Checkpoint (required for all PRs)

When opening or updating a pull request, include this block at the very top of the PR description:

```
<!-- review-checkpoint
{"v":1,"goal":"<what this PR accomplishes, 1-3 sentences>","constraints":"<key constraints or empty string>","riskAreas":"<where reviewers should focus or empty string>","agent":"claude-code","ts":"<ISO 8601 UTC timestamp>"}
-->
```

Rules:
- `goal`: outcome and why, not what files changed
- `constraints`: what was non-negotiable (compat, no new deps, etc.)
- `riskAreas`: what a careful reviewer should double-check — edge cases, subtle decisions
- Use `""` for constraints/riskAreas if none exist
- Follow the block with a plain-text summary (this is what GitHub renders in the PR view)

This powers the Review Checkpoint GitHub Action installed on this repo.
Full schema: `docs/agent-pr-format.md`
