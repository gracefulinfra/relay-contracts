# Follow-ups

Out-of-scope work noticed while implementing a slice. Add an entry instead of doing the work.
Format: `- [ ] (<prompt that found it>) <what> — <why it matters>`.

- [ ] (P0-01) Delete `schemas/bootstrap-smoke.schema.json`, its fixtures, and the placeholder `openapi/openapi.yaml` once real contracts land, and add client generation and a drift check to CI. Owner: P0-04.
- [ ] (P0-01) Run actionlint (with shellcheck) in CI. It currently runs only locally. Candidate: a shared reusable workflow. Owner: P1-19 or earlier.
- [ ] (P0-02) Relay's analytics client-IP must be validated against trusted proxies; Castopod's is spoofable via X-Forwarded-For (inflates download counts). Owner: P1-17.
- [ ] (P0-02) Ensure Relay premium/private media is served via signed, expiring URLs (fail-closed), never a public guessable path — Castopod redirects a valid token to a public unsigned URL. Owner: P3-03/P3-04.
- [ ] (P0-02) Feed import must preserve item-level namespace tags (transcript/chapters/season/episode), roll back on failure, and set 301 old→new redirects. Owner: P1-16.
- [ ] (P0-03) Feed the vendor price table in `evaluations/vendors.md` (section C) into the cost model as the "buy" comparison, keeping unpublished prices (Omny) as unknown rather than zero. Owner: P0-08.
- [ ] (P0-03) Model Relay's outbound webhooks on Omny's shape (`{Entity}{ChangeType}` events, HMAC-SHA256 signature header, shared secret) and add an audit-events read API. No evaluated vendor documents an approval or audit trail that export could carry. Owner: P0-04 / P1-09.
- [ ] (P0-03) Portfolio write-ups must name Omny Studio as the benchmark and state that Relay can't deliver Apple HLS video (partner hosts only) or claim IAB certification. Owner: P1-20 and the P3-08 final report.
- [ ] (P0-03) Seed the P2-09 destination capability matrix from the verified facts in `evaluations/vendors.md`: Apple HLS video needs a partner host; the Spotify Distribution API is partner-only and there is no documented creator API (RSS or manual only); YouTube Data API uploads have their own quota bucket (100 `videos.insert` a day by default) and are private until the project passes an audit. Owner: P2-09.
