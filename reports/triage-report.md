# TriageKit PR Readiness Report

* Repository: corsairdev/corsair
* Generated at: 2026-06-18T19:01:44.525Z
* PRs scanned: 10
* Note: "This is a triage signal, not a merge decision."

| Bucket | Count |
| ------------------------ | ----: |
| Ready for founder review |     0 |
| Almost ready |     0 |
| Needs author action |     9 |
| Risky / broad |     0 |
| Not ready |     1 |

## Most urgent author actions

* #295 feat(ahrefs): add initial plugin implementation — missing demo/testing update
* #292 perf(www): stream OSS pages with cached splits and granular invalidation — no linked issue found
* #258 feat(whatsapp): implement complete WhatsApp integration (#254) — PR is still draft
* #275 ci: bump actions/setup-node from 4 to 6 — no package/change scope detected
* #287 feat(plugin): Add 1Password Connect integration — no linked issue found
* #267 feat(supabase): add supabase integration — missing demo/testing update
* #263 feat(client): add React hooks — `createCorsairReactClient()` — no test proof found
* #291 Feat/edit before approve — no linked issue found
* #294 Feat/execution history audit trail — no linked issue found
* #293 feat: Add Webhook Tenant Matcher for all Plugins — no linked issue found

## Highest-risk PRs

* #294 Feat/execution history audit trail — 40/100, 4 risk signal(s)
* #293 feat: Add Webhook Tenant Matcher for all Plugins — 35/100, 3 risk signal(s)
* #291 Feat/edit before approve — 52/100, 3 risk signal(s)
* #263 feat(client): add React hooks — `createCorsairReactClient()` — 62/100, 3 risk signal(s)
* #267 feat(supabase): add supabase integration — 65/100, 3 risk signal(s)
* #258 feat(whatsapp): implement complete WhatsApp integration (#254) — 72/100, 3 risk signal(s)
* #295 feat(ahrefs): add initial plugin implementation — 75/100, 2 risk signal(s)

## Ready for founder review

_No PRs in this bucket._

## Almost ready

_No PRs in this bucket._

## Needs author action

### #295 feat(ahrefs): add initial plugin implementation

* Author: sujal12344
* URL: https://github.com/corsairdev/corsair/pull/295
* Score: 75/100
* Classification: Needs author action
* Files changed: 23
* Additions/deletions: +2499 / -139
* Detected packages: ahrefs, corsair
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* Plugin/integration PR missing demo/testing update

Risk signals:

* Core touch: Only expected registration/config core paths touched
* Large PR: 23 files, 2499 additions, 139 deletions

Key rule results:

* ✅ Linked issue: Found "Fixes #277"
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ✅ Test proof: PR body includes testing proof
* ✅ Auth/webhook notes: Auth/webhook-related notes or paths found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #263 feat(client): add React hooks — `createCorsairReactClient()`

* Author: yuvrxj-afk
* URL: https://github.com/corsairdev/corsair/pull/263
* Score: 62/100
* Classification: Needs author action
* Files changed: 9
* Additions/deletions: +1515 / -77
* Detected packages: corsair
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No test proof found

Risk signals:

* Core touch: 3 risky core/framework file(s) touched
* Large PR: 9 files, 1515 additions, 77 deletions
* Unsafe TypeScript: 9 occurrence(s) found: as any, as unknown as, : any

Key rule results:

* ⚠️ Linked issue: Found loose reference "#250"
* ➖ Demo/testing: not required for non-plugin PR
* ❌ Test proof: No test proof found in PR body
* ➖ Auth/webhook notes: not required for non-plugin PR

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No test proof found. After that, this should be easier to review.

### #294 Feat/execution history audit trail

* Author: abhay-2108
* URL: https://github.com/corsairdev/corsair/pull/294
* Score: 40/100
* Classification: Needs author action
* Files changed: 20
* Additions/deletions: +1779 / -534
* Detected packages: corsair, slack, studio
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No linked issue found
* Plugin/integration PR missing demo/testing update

Risk signals:

* Core touch: 11 risky core/framework files touched
* Large PR: 20 files, 1779 additions, 534 deletions
* Unsafe TypeScript: 13 occurrence(s) found: @ts-expect-error, as any, : any
* Auth/webhook notes: No auth, webhook, schema, or endpoint signal found

Key rule results:

* ❌ Linked issue: No linked issue reference found
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ✅ Test proof: PR body includes testing proof
* ❌ Auth/webhook notes: No auth, webhook, schema, or endpoint signal found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No linked issue found; Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #293 feat: Add Webhook Tenant Matcher for all Plugins

* Author: devjain32
* URL: https://github.com/corsairdev/corsair/pull/293
* Score: 35/100
* Classification: Needs author action
* Files changed: 172
* Additions/deletions: +3837 / -128
* Detected packages: airtable, amplitude, asana, bluesky, box, cal, calendly, cli, cloudflare, corsair, cursor, discord, dodopayments, dropbox, exa, figma, firecrawl, fireflies, github, gitlab, gmail, googlecalendar, googledrive, googlesheets, grafana, hackernews, hubspot, intercom, jira, linear, monday, notion, onedrive, openweathermap, oura, outlook, pagerduty, posthog, razorpay, reddit, resend, sentry, sharepoint, slack, spotify, strava, stripe, tally, tavily, teams, telegram, todoist, trello, twilio, twitter, twitterapiio, typeform, vapi, vercel, xquik, youtube, zendesk, zohomail, zoom
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No linked issue found
* Plugin/integration PR missing demo/testing update
* No test proof found

Risk signals:

* Core touch: 16 risky core/framework files touched
* Large PR: 172 files, 3837 additions, 128 deletions
* Unsafe TypeScript: 3 occurrence(s) found: as unknown as

Key rule results:

* ❌ Linked issue: No linked issue reference found
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ❌ Test proof: No test proof found in PR body
* ✅ Auth/webhook notes: Auth/webhook-related notes or paths found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No linked issue found; Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #292 perf(www): stream OSS pages with cached splits and granular invalidation

* Author: yuvrxj-afk
* URL: https://github.com/corsairdev/corsair/pull/292
* Score: 75/100
* Classification: Needs author action
* Files changed: 18
* Additions/deletions: +1204 / -138
* Detected packages: none
* Touches demo/testing: no
* Touches core: no

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No linked issue found
* No package/change scope detected

Risk signals:

* Large PR: 18 files, 1204 additions, 138 deletions

Key rule results:

* ❌ Linked issue: No linked issue reference found
* ➖ Demo/testing: not required for non-plugin PR
* ✅ Test proof: PR body includes testing proof
* ➖ Auth/webhook notes: not required for non-plugin PR

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No linked issue found; No package/change scope detected. After that, this should be easier to review.

### #291 Feat/edit before approve

* Author: abhay-2108
* URL: https://github.com/corsairdev/corsair/pull/291
* Score: 52/100
* Classification: Needs author action
* Files changed: 12
* Additions/deletions: +672 / -516
* Detected packages: corsair, slack, studio
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No linked issue found
* Plugin/integration PR missing demo/testing update

Risk signals:

* Core touch: 6 risky core/framework files touched
* Unsafe TypeScript: 3 occurrence(s) found: @ts-expect-error, as any
* Auth/webhook notes: Endpoint/schema signal found, but no auth or webhook signal

Key rule results:

* ❌ Linked issue: No linked issue reference found
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ✅ Test proof: PR body includes testing proof
* ⚠️ Auth/webhook notes: Endpoint/schema signal found, but no auth or webhook signal

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No linked issue found; Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #287 feat(plugin): Add 1Password Connect integration

* Author: SH20RAJ
* URL: https://github.com/corsairdev/corsair/pull/287
* Score: 65/100
* Classification: Needs author action
* Files changed: 14
* Additions/deletions: +815 / -0
* Detected packages: corsair, onepassword
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No linked issue found
* Plugin/integration PR missing demo/testing update

Risk signals:

* Core touch: Only expected registration/config core paths touched

Key rule results:

* ❌ Linked issue: No linked issue reference found
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ✅ Test proof: PR body includes testing proof
* ✅ Auth/webhook notes: Auth/webhook-related notes or paths found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No linked issue found; Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #267 feat(supabase): add supabase integration

* Author: ambikeesshh
* URL: https://github.com/corsairdev/corsair/pull/267
* Score: 65/100
* Classification: Needs author action
* Files changed: 53
* Additions/deletions: +14140 / -9
* Detected packages: corsair, supabase
* Touches demo/testing: no
* Touches core: yes

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* Plugin/integration PR missing demo/testing update

Risk signals:

* Core touch: Only expected registration/config core paths touched
* Large PR: 53 files, 14140 additions, 9 deletions
* Unsafe TypeScript: 3 occurrence(s) found: as unknown as

Key rule results:

* ✅ Linked issue: Found "fixes #266"
* ❌ Demo/testing: Plugin PR but demo/testing not updated
* ✅ Test proof: PR body includes testing proof
* ✅ Auth/webhook notes: Auth/webhook-related notes or paths found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: Plugin/integration PR missing demo/testing update. After that, this should be easier to review.

### #275 ci: bump actions/setup-node from 4 to 6

* Author: dependabot[bot]
* URL: https://github.com/corsairdev/corsair/pull/275
* Score: 72/100
* Classification: Needs author action
* Files changed: 2
* Additions/deletions: +2 / -2
* Detected packages: none
* Touches demo/testing: no
* Touches core: no

Founder action:
Ask the author to fix blockers before spending deep review time.

Blockers:

* No package/change scope detected
* No test proof found

Risk signals:

* none

Key rule results:

* ⚠️ Linked issue: Found loose reference "#1374"
* ➖ Demo/testing: not required for non-plugin PR
* ❌ Test proof: No test proof found in PR body
* ➖ Auth/webhook notes: not required for non-plugin PR

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: No package/change scope detected; No test proof found. After that, this should be easier to review.

## Risky / broad

_No PRs in this bucket._

## Not ready

### #258 feat(whatsapp): implement complete WhatsApp integration (#254)

* Author: Dhirenderchoudhary
* URL: https://github.com/corsairdev/corsair/pull/258
* Score: 72/100
* Classification: Not ready
* Files changed: 40
* Additions/deletions: +3681 / -34
* Detected packages: corsair, linear, slack, whatsapp
* Touches demo/testing: yes
* Touches core: yes

Founder action:
Do not review yet. Wait until the PR is no longer draft or basic readiness blockers are fixed.

Blockers:

* PR is still draft

Risk signals:

* Core touch: Only expected registration/config core paths touched
* Large PR: 40 files, 3681 additions, 34 deletions
* Unsafe TypeScript: 49 occurrence(s) found: as any, : any

Key rule results:

* ✅ Linked issue: Found "Closes #254"
* ✅ Demo/testing: Plugin PR updates demo/testing
* ✅ Test proof: PR body includes testing proof
* ✅ Auth/webhook notes: Auth/webhook-related notes or paths found

Suggested contributor comment:
Thanks for the PR! Before this is ready for maintainer review, please fix: PR is still draft. After that, this should be easier to review.
