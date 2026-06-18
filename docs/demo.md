# TriageKit Demo

## Problem

Maintainers in high-volume OSS projects often need to decide which pull requests deserve deep review first. Many PRs are incomplete, missing context, too broad, or need contributor follow-up before a maintainer should spend serious review time.

TriageKit gives maintainers a fast, deterministic first pass.

## How It Works

TriageKit:

- fetches open pull requests from a public GitHub repository
- fetches changed files for each PR
- detects package and core path touches
- runs deterministic readiness rules
- calculates a triage score and classification
- writes a local markdown report when `--report` is used

It does not run PR code and does not write to GitHub.

## Example Command

```sh
pnpm dev repo corsairdev/corsair --limit 10 --report
```

## Example Output Summary

```text
Report written to reports/triage-report.md
Open it with:
code reports/triage-report.md
PRs scanned: 10
Counts per bucket:
- Ready for founder review: 0
- Almost ready: 0
- Needs author action: 9
- Risky / broad: 0
- Not ready: 1
```

## What The Founder Or Maintainer Gets

The report shows:

- which PRs are ready for founder review
- which PRs need author action
- which PRs look broad or risky
- blockers and risk signals for each PR
- suggested contributor comments that maintainers can adapt
- key rule results for fast context

This helps maintainers spend deep review time where it is most likely to matter.

## Why It Is Safe

TriageKit is read-only with respect to GitHub. It uses the GitHub API to fetch public PR metadata and changed files.

It does not:

- run untrusted PR code
- post comments
- add labels
- trigger GitHub Actions
- call AI or model APIs
- write to GitHub

The only write operation is local report generation, such as `reports/triage-report.md`.
