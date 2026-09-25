# Follow-ups

Out-of-scope work noticed while implementing a slice. Add an entry instead of doing the work.
Format: `- [ ] (<prompt that found it>) <what> — <why it matters>`.

- [ ] (P0-01) Delete `schemas/bootstrap-smoke.schema.json`, its fixtures, and the placeholder `openapi/openapi.yaml` once real contracts land, and add client generation and a drift check to CI. Owner: P0-04.
- [ ] (P0-01) Run actionlint (with shellcheck) in CI. It currently runs only locally. Candidate: a shared reusable workflow. Owner: P1-19 or earlier.
