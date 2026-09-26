# Follow-ups

Out-of-scope work noticed while implementing a slice. Add an entry instead of doing the work.
Format: `- [ ] (<prompt that found it>) <what> — <why it matters>`.

- [ ] (P0-01) Delete `schemas/bootstrap-smoke.schema.json`, its fixtures, and the placeholder `openapi/openapi.yaml` once real contracts land, and add client generation and a drift check to CI. Owner: P0-04.
- [ ] (P0-01) Run actionlint (with shellcheck) in CI. It currently runs only locally. Candidate: a shared reusable workflow. Owner: P1-19 or earlier.
- [ ] (P0-02) Relay's analytics client-IP must be validated against trusted proxies; Castopod's is spoofable via X-Forwarded-For (inflates download counts). Owner: P1-17.
- [ ] (P0-02) Ensure Relay premium/private media is served via signed, expiring URLs (fail-closed), never a public guessable path — Castopod redirects a valid token to a public unsigned URL. Owner: P3-03/P3-04.
- [ ] (P0-02) Feed import must preserve item-level namespace tags (transcript/chapters/season/episode), roll back on failure, and set 301 old→new redirects. Owner: P1-16.
- [ ] (P0-03) Before the P0-08 cost model, recheck Captivate pricing and the Apple HLS video add-on price by hand. `www.captivate.fm` blocks automated fetches, so the price isn't in the vendor evaluation. Owner: P0-08.
- [ ] (P0-03) The P2-09 destination capability matrix should record YouTube's upload quota bucket (100 `videos.insert` a day by default) and forced-private uploads for unaudited projects, and Spotify for Creators' lack of a documented creator API (RSS or manual only). Owner: P2-09.
- [ ] (P0-03) Portfolio write-ups must name Omny Studio as the benchmark and state that Relay can't deliver Apple HLS video (partner hosts only) or claim IAB certification. Owner: P1-20 and the P3-08 final report.
