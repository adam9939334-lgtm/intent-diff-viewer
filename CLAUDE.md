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
- Violet (`violet-500/600`) is the brand accent color
