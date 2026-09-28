# Follow-ups

Out-of-scope work noticed while implementing a slice. Add an entry instead of doing the work.
Format: `- [ ] (<prompt that found it>) <what> — <why it matters>`.

- [ ] (P0-01) Delete the placeholder `openapi/openapi.yaml` once real contracts land, and add client generation and a drift check to CI. The bootstrap smoke schema was removed in the first P0-04 PR. Owner: P0-04 (second PR).
- [ ] (P0-01) Run actionlint (with shellcheck) in CI. It currently runs only locally. Candidate: a shared reusable workflow. Owner: P1-19 or earlier.
- [ ] (P0-02) Relay's analytics client-IP must be validated against trusted proxies; Castopod's is spoofable via X-Forwarded-For (inflates download counts). Owner: P1-17.
- [ ] (P0-02) Ensure Relay premium/private media is served via signed, expiring URLs (fail-closed), never a public guessable path — Castopod redirects a valid token to a public unsigned URL. Owner: P3-03/P3-04.
- [ ] (P0-02) Feed import must preserve item-level namespace tags (transcript/chapters/season/episode), roll back on failure, and set 301 old→new redirects. Owner: P1-16.
- [x] (P0-03) Feed the vendor price table in `evaluations/vendors.md` (section C) into the cost model as the "buy" comparison, keeping unpublished prices (Omny) as unknown rather than zero. Owner: P0-08. Done: `reports/cost-model.md` compares against it, and Omny is listed as unknown.
- [ ] (P0-03) Model Relay's outbound webhooks on Omny's shape (`{Entity}{ChangeType}` events, HMAC-SHA256 signature header, shared secret) and add an audit-events read API. No evaluated vendor documents an approval or audit trail that export could carry. Owner: P0-04 / P1-09.
- [ ] (P0-03) Portfolio write-ups must name Omny Studio as the benchmark and state that Relay can't deliver Apple HLS video (partner hosts only) or claim IAB certification. Owner: P1-20 and the P3-08 final report.
- [ ] (P0-03) Seed the P2-09 destination capability matrix from the verified facts in `evaluations/vendors.md`: Apple HLS video needs a partner host; the Spotify Distribution API is partner-only and there is no documented creator API (RSS or manual only); YouTube Data API uploads have their own quota bucket (100 `videos.insert` a day by default) and are private until the project passes an audit. Owner: P2-09.
- [ ] (P0-04) Render-check the Mermaid diagrams in `model/` in CI. They are checked locally with `@mermaid-js/mermaid-cli` 11, which needs a headless browser, so it is kept out of the `check` job for now. Owner: P1-19 or earlier.
- [ ] (P0-04) Enforce the release-manifest invariants in `scripts/invariants/release-manifest.mjs` in relay-api before a manifest is written, and add a contract test that runs these fixtures against the Go implementation. Owner: P1-09.
- [x] (P0-04) Add the ADR 0006 retention period (90 days by default) for retired media versions to the storage cost model. Owner: P0-08. Done: `storage_retired_versions_gb` in `reports/cost-model/`.
- [ ] (P0-08) Replace the assumed compute factors in `reports/cost-model/inputs.csv` (`audio_encode_`, `transcribe_`, `video_encode_cpu_h_per_media_h`) with the benchmarks from P1-06, P1-07, and P2-01, and regenerate the outputs. Owner: P1-06, P1-07, P2-01.
- [ ] (P0-08) Re-check the Phase 1 tripwire (P1-01 to P1-11 merged within 16 weeks of 2026-09-28; the laptop within the `reports/phase-0.md` resource budget) and the budget. Re-run the gate as "narrow" if either fails. Owner: P1-11, P1-20.
- [ ] (P0-08) Decide the $0-budget prerequisites listed in `reports/phase-0.md`: the hosted transcription provider (P1-07), an off-laptop backup target (P1-18), and a public URL for feed validators (P1-20). Owner: the project owner, before each prompt starts.
