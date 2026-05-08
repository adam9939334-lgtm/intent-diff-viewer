# Claude Code — Review Checkpoint Integration

Add this to your project's `CLAUDE.md` file to make Claude Code automatically generate
a Review Checkpoint whenever it opens or updates a pull request.

---

## Paste into CLAUDE.md

```markdown
## Review Checkpoint

When opening or updating a pull request, include a Review Checkpoint block at the
top of the PR description. This is required for every PR.

Format:

\`\`\`
<!-- review-checkpoint
{"v":1,"goal":"<outcome this PR achieves, 1-3 sentences>","constraints":"<constraints that shaped the implementation, or empty string>","riskAreas":"<what reviewers should scrutinize, edge cases, or empty string>","agent":"claude-code","ts":"<current ISO 8601 UTC timestamp>"}
-->
\`\`\`

Rules:
- goal: what the PR accomplishes and why, not what files changed
- constraints: non-negotiables given in the prompt, backward compat requirements, forbidden approaches
- riskAreas: anything a careful reviewer should double-check, subtle decisions, edge cases
- Use empty string "" for constraints and riskAreas if genuinely none exist
- Put the block at the very top of the PR body, before any other content
- Follow with a plain-text summary of the changes for the GitHub PR view

Example:
\`\`\`
<!-- review-checkpoint
{"v":1,"goal":"Migrate the auth layer from session cookies to JWT to enable stateless horizontal scaling.","constraints":"All existing API endpoints must remain unchanged. No new npm dependencies.","riskAreas":"Token refresh edge case in middleware.ts line 47. Session cleanup on logout was rewritten.","agent":"claude-code","ts":"2026-05-08T21:00:00Z"}
-->

Replaces express-session with a stateless JWT middleware. All routes unchanged.
Tests pass. No API surface changes.
\`\`\`
```

---

## What happens automatically

Once this snippet is in `CLAUDE.md` and the Review Checkpoint GitHub Action is installed
in the repository:

1. Claude Code opens a PR with the JSON block at the top
2. The Action parses the block (no regex, deterministic JSON parsing)
3. A structured Review Checkpoint comment appears on the PR automatically
4. Reviewer sees Goal, Constraints, and Risk Areas before reading the diff
5. Comment includes a link to the rich diff viewer with full syntax highlighting

Install the Action: see [`docs/review-checkpoint-action.yml`](review-checkpoint-action.yml)
Full schema reference: see [`docs/agent-pr-format.md`](agent-pr-format.md)
