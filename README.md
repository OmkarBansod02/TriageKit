# TriageKit

TriageKit is a lightweight, read-only PR triage CLI for maintainers.

It scans public GitHub pull requests, fetches changed files, runs deterministic readiness checks, calculates a triage score, and can generate a founder-ready markdown report.

## Why It Exists

High-volume OSS projects can receive more pull requests than maintainers can deeply review. TriageKit helps maintainers quickly separate:

- PRs that look ready for deeper review
- PRs that need contributor follow-up
- PRs that are broad or risky enough to review separately

It is a prioritization tool, not a merge decision.

## Current Status

V0 proof of concept.

TriageKit is read-only. It reads public GitHub PR data and writes only local terminal output or a local markdown report.

## Setup

```sh
pnpm install
pnpm typecheck
```

Optional GitHub token for higher public API limits:

```sh
export GITHUB_TOKEN=ghp_your_token_here
```

## Example Command

```sh
pnpm dev repo corsairdev/corsair --limit 10
```

The repository argument must use `owner/repo` format. `--limit` defaults to 10.

## Report Mode

Generate a local markdown report:

```sh
pnpm dev repo corsairdev/corsair --limit 10 --report
```

Default report path:

```text
reports/triage-report.md
```

Choose another local path:

```sh
pnpm dev repo corsairdev/corsair --limit 20 --report --report-path reports/corsair.md
```

## What It Checks

TriageKit currently checks:

- PR metadata: title, author, draft status, state, URL, dates
- changed files, additions, and deletions
- package roots under `packages/<name>/...`
- detected package names
- whether the PR touches `demo/testing/`
- whether the PR touches core/framework areas
- linked issue references
- PR description quality
- testing proof in the PR body
- risky TypeScript patch patterns
- plugin/integration auth, webhook, schema, or endpoint signals
- size and core-touch risk

It then prints:

- deterministic rule results
- a 0-100 readiness score
- a maintainer-facing classification
- founder action text
- blockers and risk signals

Classifications:

- Ready for founder review
- Almost ready
- Needs author action
- Risky / broad
- Not ready

## Useful Flags

```sh
pnpm dev repo corsairdev/corsair --limit 2 --files
pnpm dev repo corsairdev/corsair --limit 2 --breakdown
pnpm dev repo corsairdev/corsair --limit 2 --no-rules
pnpm dev repo corsairdev/corsair --limit 10 --report
```

## What It Does Not Do

TriageKit does not:

- verify code correctness
- replace CI, Greptile, or human review
- run untrusted PR code
- call AI or model APIs
- comment on GitHub PRs
- add labels
- trigger GitHub Actions
- write to GitHub

## Demo

See [docs/demo.md](docs/demo.md) for the founder-demo walkthrough.

## Future Possibilities

- GitHub Action mode
- GitHub PR comments
- labels
- custom rulesets
- Greptile and CI signal ingestion
- project-specific maintainer policies
