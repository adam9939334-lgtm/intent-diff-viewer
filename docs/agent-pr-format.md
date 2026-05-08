# Agent PR Format — Review Checkpoint v1

This document defines the canonical format for a Review Checkpoint that a coding agent
(Claude Code, Codex, Cursor, or any other) should produce when opening or updating a PR.

---

## Schema v1

The checkpoint is embedded as a hidden JSON block at the top of the PR description.
GitHub renders it as invisible (HTML comment). The Review Checkpoint Action extracts it.

```
<!-- review-checkpoint
{"v":1,"goal":"...","constraints":"...","riskAreas":"...","agent":"claude-code","ts":"2026-05-08T21:00:00Z"}
-->
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `v` | number | yes | Schema version. Always `1` for now. |
| `goal` | string | yes | What this PR accomplishes. 1–3 sentences. Focus on outcome, not implementation. |
| `constraints` | string | no | Key constraints that were given or assumed. What must not break. Tradeoffs accepted. Empty string `""` if none. |
| `riskAreas` | string | no | Where reviewers should focus scrutiny. Edge cases. Surprising decisions. Empty string `""` if none. |
| `agent` | string | yes | The agent or tool that generated this. Use: `"claude-code"`, `"codex"`, `"cursor"`, `"copilot"`, or `"human"`. |
| `ts` | string | yes | ISO 8601 UTC timestamp of when the checkpoint was generated. |

---

## Full PR Body Template (agent output)

```
<!-- review-checkpoint
{"v":1,"goal":"<1-3 sentences: what this PR accomplishes and why>","constraints":"<key constraints, or empty string>","riskAreas":"<where reviewers should focus, or empty string>","agent":"claude-code","ts":"<ISO 8601 UTC>"}
-->

<Human-readable summary of what changed. This is what GitHub shows in the PR description.>
```

### Example: auth middleware refactor

```
<!-- review-checkpoint
{"v":1,"goal":"Refactor authentication middleware to use JWT tokens and remove the express-session dependency. This enables stateless auth and reduces Redis coupling.","constraints":"Must maintain backward compatibility with all existing API consumers. No new npm packages. All existing tests must pass without modification.","riskAreas":"Token expiry and refresh logic in auth/middleware.ts. The logout endpoint was rewritten — verify no session state leaks. Cookie-based auth is fully removed — check for any remaining session reads in downstream middleware.","agent":"claude-code","ts":"2026-05-08T21:00:00Z"}
-->

Refactors the auth layer from session-based to JWT-based. Removes `express-session`
and `connect-redis`. Adds a stateless JWT verify middleware. All routes unchanged.
```

### Example: small bug fix

```
<!-- review-checkpoint
{"v":1,"goal":"Fix a race condition in the file upload handler where concurrent uploads to the same path could corrupt the destination file.","constraints":"Must not change the public API signature. Fix must work without a mutex library.","riskAreas":"The fix uses a per-path lock map — check for memory leaks if paths are never cleaned up.","agent":"claude-code","ts":"2026-05-08T21:15:00Z"}
-->

Adds a simple per-path lock to prevent concurrent write collisions in the upload handler.
```

---

## Writing Good Checkpoints

**Goal** — outcome, not mechanics:
- ✓ "Enable stateless auth and reduce Redis coupling"
- ✗ "Changed middleware.ts to use jwt.verify instead of session lookup"

**Constraints** — what was non-negotiable:
- ✓ "No new npm packages. Must not break existing API consumers."
- ✗ "I tried to keep it simple."

**Risk Areas** — what a careful reviewer should check:
- ✓ "Token expiry edge case in line 47. The logout flow was rewritten."
- ✗ "There might be some issues."

---

## Fallback: Markdown Sections (human-written)

If no JSON block is present, the Action falls back to parsing markdown sections:

```markdown
## Goal
...

## Constraints
...

## Risk Areas
...
```

Both formats are supported. The JSON block takes priority.
