# TriageKit

A lightweight PR triage CLI for maintainers.

TriageKit is a read-only command line tool for inspecting GitHub pull requests. It fetches open pull requests from public repositories, prints basic metadata, summarizes changed files, and detects simple package/core path touches so maintainers have a small foundation for future triage workflows.

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

Out of scope for the current phase: scoring, classification, a rule engine, markdown reports, comments, labels, GitHub Actions, and AI summaries.

## Future Phases

Future versions may add review-readiness reports, configurable triage rules, markdown output, CI-friendly modes, and maintainer-focused summaries.
