# TriageKit

A lightweight PR triage CLI for maintainers.

TriageKit is a read-only command line tool for inspecting GitHub pull requests. Phase 1 fetches open pull requests from public repositories and prints basic metadata so maintainers have a small foundation for future triage workflows.

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

The Phase 1 CLI only reads public pull request data. It does not comment, label, update, or otherwise write to GitHub.

## Usage

```sh
pnpm dev repo corsairdev/corsair --limit 10
```

The repository argument must use `owner/repo` format. `--limit` is optional and defaults to 10.

## Phase 1 Scope

Phase 1 fetches open pull requests and prints:

- PR number
- title
- author login
- draft status
- state
- HTML URL
- created date
- updated date

Out of scope for Phase 1: scoring, a rule engine, markdown reports, comments, labels, GitHub Actions, and AI summaries.

## Future Phases

Future versions may add review-readiness reports, configurable triage rules, markdown output, CI-friendly modes, and maintainer-focused summaries.
