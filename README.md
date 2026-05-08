# Intent Diff Viewer

A GitHub-native review layer for AI-generated pull requests.

**The problem:** AI agents ship PRs fast. Reviewers see the diff but not the intent — what the agent was trying to accomplish, what constraints it was given, where the risk is.

**The fix:** A Review Checkpoint — Goal, Constraints, Risk Areas — posted automatically as a PR comment. No new tools. No new tabs.

---

## Get a Review Checkpoint in 60 seconds

**Step 1.** Add the PR template to your repo:

`.github/pull_request_template.md`
```markdown
## Goal
<!-- What was the agent/you trying to accomplish? -->

## Constraints
<!-- What rules or limits apply? (optional) -->

## Risk Areas
<!-- Where should reviewers focus? What could go wrong? (optional) -->

## Changes
<!-- Brief summary of what actually changed. -->
```

**Step 2.** Add the workflow file:

Copy [`docs/review-checkpoint-action.yml`](docs/review-checkpoint-action.yml) to `.github/workflows/review-checkpoint.yml` in your repo.

**Step 3.** Open a PR using the template — fill in the Goal section at minimum.

**Step 4.** See the checkpoint comment appear automatically:

```
Review Checkpoint

Goal — Refactor auth middleware to use JWT tokens

Constraints — Must stay backward-compatible. No new npm packages.

⚠ Risk Areas — Token expiry edge cases. The logout flow was rewritten.

View diff with context ↗
```

No API keys. No OAuth. No configuration. Just two files.

---

## Demo site

Paste any public GitHub PR URL: **[intent-diff-viewer.vercel.app](https://intent-diff-viewer.vercel.app)**

The site renders the diff with structured intent side by side and generates a shareable link.

---

## How it works

1. The GitHub Action triggers on `pull_request` (open, edit, sync)
2. Parses `## Goal`, `## Constraints`, and `## Risk Areas` from the PR description
3. Posts a structured comment with a link to the rich diff viewer
4. Updates the comment idempotently on edits — no spam
5. Fails gracefully on forks or permission issues (logs and exits cleanly)

---

## Why structured fields instead of freeform

A freeform description is what a PR already has. Structured fields are different:

- **Goal** forces the author to state the intent, not just describe the change
- **Constraints** surfaces tradeoffs that aren't visible in the diff
- **Risk Areas** directs reviewer attention before they start reading

---

## Stack

- GitHub Action: `actions/github-script` (inline, no build step)
- Rich diff viewer: Next.js 16 + `@pierre/diffs` on Vercel
- GitHub API: `@octokit/rest`

---

## Status

Early prototype. Dogfooding on our own PRs and testing with a handful of developers.

If it's useful or pointless, [open an issue](https://github.com/adam9939334-lgtm/intent-diff-viewer/issues) and say so.
