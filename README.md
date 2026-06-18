# TriageKit

A lightweight PR triage CLI for maintainers.

TriageKit is a read-only command line tool for inspecting GitHub pull requests. It fetches open pull requests from public repositories, prints basic metadata, summarizes changed files, detects simple package/core path touches, runs deterministic readiness rules, and calculates a maintainer-facing triage score so maintainers have a small foundation for future triage workflows.

## Setup

```sh
pnpm install
pnpm typecheck
```

## GitHub Token

TriageKit can read public repositories without authentication. To increase GitHub API rate limits, set an optional token:

```sh
export GITHUB_TOKEN=ghp_your_token_here
```

The CLI only reads public pull request data. It does not comment, label, update, or otherwise write to GitHub.

## Usage

```sh
pnpm dev repo corsairdev/corsair --limit 10
```

The repository argument must use `owner/repo` format. `--limit` is optional and defaults to 10.

To include changed file paths under each pull request, add `--files`:

```sh
pnpm dev repo corsairdev/corsair --limit 2 --files
```

Rules are printed by default. To hide them, add `--no-rules`:

```sh
pnpm dev repo corsairdev/corsair --limit 2 --no-rules
```

To include the full scoring breakdown, add `--breakdown`:

```sh
pnpm dev repo corsairdev/corsair --limit 2 --breakdown
```

## Current Scope

TriageKit currently fetches open pull requests and prints:

- PR number
- title
- author login
- draft status
- state
- HTML URL
- created date
- updated date
- files changed
- additions and deletions
- detected package roots from `packages/<name>/...` paths
- detected package names
- whether files touch `demo/testing/`
- whether files touch core/framework areas such as `packages/corsair/`, `packages/cli/`, `packages/studio/`, `packages/mcp/`, `packages/db/`, `packages/api/`, or `apps/`
- deterministic readiness-rule results
- a 0-100 readiness score
- a maintainer-facing classification and founder action
- blockers and risk signals

## Rule Engine

The rule engine prints readiness signals, not merge decisions.

Implemented rules:

- draft PR status
- linked issue reference
- detected package roots
- demo/testing updates for plugin or integration PRs
- core/framework touches
- size risk
- unsafe TypeScript patch patterns
- PR description quality
- testing proof in the PR body
- auth/webhook notes for plugin or integration PRs

## Scoring

The Phase 4 scoring model converts deterministic rule results into a 0-100 readiness score, classification, founder action, blockers, and risk signals. The score is a triage signal to prioritize review effort; it is not a merge decision.

Classifications:

- Ready for founder review
- Almost ready
- Needs author action
- Risky / broad
- Not ready

Use `--breakdown` to print each rule's point contribution.

Out of scope for the current phase: markdown reports, comments, labels, GitHub Actions, and AI summaries.

## Future Phases

Future versions may add review-readiness reports, configurable triage rules, markdown output, CI-friendly modes, and maintainer-focused summaries.
