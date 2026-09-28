# Phase 0 gate report (P0-08)

|                 |                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Date            | 2026-09-28                                                                                              |
| Operating owner | **@lafronzt** (project owner): product, engineering, operations, and storage/database ownership         |
| Decision        | **PROCEED, conditionally.** Phase 1 starts, but two unfinished Phase 0 packages are entry conditions    |
| Build vs buy    | [ADR 0005](../adr/0005-build-vs-buy.md) is **accepted**: (c) custom Relay, for demonstration value only |
| Budget          | About **10 hours a week** of owner time and **$0 cash**. Everything runs on the owner's laptop          |

Evidence was read at relay-contracts
[`e7af96c`](https://github.com/gracefulinfra/relay-contracts/tree/e7af96c) and relay-infra
[`07559ad`](https://github.com/gracefulinfra/relay-infra/tree/07559ad) (both `main`, 2026-09-28).
The other four repos are unchanged since P0-01.

## Decision

The pitch gate asks for _"specific unmet needs documented; named operating owner; credible cost model
and portability path."_

| Gate criterion         | Result                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unmet needs documented | **Met, as demonstration value.** No evaluated vendor or Castopod documents an approval-gated release record (R2), full versioned export (R11), media and feeds that survive an app outage (R12), or a demonstrable provider move (R13). Relay has no network, so these are gaps worth _demonstrating_, not a measured workflow need |
| Named operating owner  | **Met.** @lafronzt owns everything, including storage and the database (pitch §10). One person is also the single point of failure. See risk 3                                                                                                                                                                                      |
| Credible cost model    | **Met.** [cost-model.md](cost-model.md) reproduces the pitch's 5.76 TB example in `pnpm test`, and prices three scenarios with unknowns kept separate from zeros                                                                                                                                                                    |
| Portability path       | **Met for a local rehearsal only.** P0-07 exported, restored, and verified the platform between two local environments with 0 manual steps. Provider portability is **not** demonstrated. It needs two real providers, which the $0 budget excludes for now                                                                         |

**Proceed** rather than narrow, because the demo scenario fits the budget in cash ($0) and the platform
fits the laptop so far. The conditions are what keep the proceed honest:

1. **P0-04 PR 2 (OpenAPI v0, client codegen, and the release workflow) merges before P1-01 and P1-12
   start.** `openapi/openapi.yaml` on `main` is still the P0-01 placeholder (`paths: {}`), and both
   P1-01 and P1-12 consume the generated clients. Owner decisions for it are already recorded (P0-04
   memory: GitHub Packages npm, a committed Go module under `gen/go`).
2. **P0-05 PR 3 (Prometheus, Grafana, OTel Collector, Tempo, and the full smoke test) merges before
   P1-05 starts.** Background work must emit metrics and traces (definition of done), and its RAM
   figure is still the missing row in the resource budget below.
3. **relay-contracts#7 (P0-06 version pins) merges.** It is open, with CI green.
4. **Tripwire for narrowing.** If P1-01 to P1-11 (the publish-to-delivery path) aren't merged within 16
   weeks (about 160 owner hours), or the laptop can't hold the budget below, re-run this gate as
   **narrow**. The fallback is in the Phase 1 scope below.

## Phase 0 artifacts

| Prompt | Result                                                                                                                                                                                                                                      | Artifacts                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01  | **Done.** Six public repos in `gracefulinfra`, protected `main`, CI, signed images with SBOM attestation (private GHCR)                                                                                                                     | [ADR 0003](../adr/0003-repository-bootstrap.md), [ADR 0004](../adr/0004-private-container-images.md), [docs/ci.md](../docs/ci.md), [version matrix](../docs/version-matrix.md)                                                                                                                                                                                                                                                                                   |
| P0-02  | **Done.** Castopod 1.15.5 hands-on. It fails rules 2 and 5 in its core (PHP on the media path, masters overwritten in place) and lacks approvals and export                                                                                 | [evaluations/castopod.md](../evaluations/castopod.md), relay-contracts#3                                                                                                                                                                                                                                                                                                                                                                                         |
| P0-03  | **Done.** Ten vendors, desk evaluation. Hosting is a commodity at $19–$64 a month; none documents approvals or full export                                                                                                                  | [evaluations/vendors.md](../evaluations/vendors.md), [ADR 0005](../adr/0005-build-vs-buy.md), relay-contracts#4                                                                                                                                                                                                                                                                                                                                                  |
| P0-04  | **Partly done.** PR 1 merged: ERD, state machines, release-manifest and delivery-receipt schemas with 47 fixtures, ADR 0006. **PR 2 (OpenAPI v0 and codegen) not started**                                                                  | [model/erd.md](../model/erd.md), [model/state-machines.md](../model/state-machines.md), [release-manifest schema](../schemas/release-manifest.schema.json), [delivery-receipt schema](../schemas/delivery-receipt.schema.json), [ADR 0006](../adr/0006-guid-and-media-versioning.md), relay-contracts#5                                                                                                                                                          |
| P0-05  | **Partly done.** PRs 1–2 merged: k3d, Argo CD, Envoy Gateway, cert-manager, ESO, CNPG with S3 backups, SeaweedFS, Keycloak with TOTP, Argo Workflows. Cold start 4m 56s, 4.4 GiB. **PR 3 (observability) not started**                      | [ADR 0007](../adr/0007-secret-management.md), [platform.md](https://github.com/gracefulinfra/relay-infra/blob/07559ad/docs/platform.md), [laptop-profile.md](https://github.com/gracefulinfra/relay-infra/blob/07559ad/docs/laptop-profile.md), relay-infra#3, relay-infra#4, relay-contracts#6                                                                                                                                                                  |
| P0-06  | **Done.** S3 conformance suite with a hard/soft split. SeaweedFS 4.47 is accepted; access logs are unsupported (soft)                                                                                                                       | [suite README](https://github.com/gracefulinfra/relay-infra/blob/07559ad/conformance/s3/README.md), [SeaweedFS report](https://github.com/gracefulinfra/relay-infra/blob/07559ad/conformance/s3/reports/seaweedfs-4.47-2026-09-27.md), relay-infra#5, relay-contracts#7 (open)                                                                                                                                                                                   |
| P0-07  | **Done, as a local rehearsal.** `local` → `local-b`: 1 GiB plus two PostgreSQL clusters, export 2m 35s, restore 6m 05s, verify 39s, 0 manual steps, $0. Found that SeaweedFS over HTTP/2 fails conditional GETs, so S3 clients use HTTP/1.1 | [ADR 0008](../adr/0008-portability-rehearsal.md), [portability.md](https://github.com/gracefulinfra/relay-infra/blob/07559ad/docs/portability.md), [run report](https://github.com/gracefulinfra/relay-infra/blob/07559ad/docs/portability/runs/20260927-local-to-local-b.md), [HTTP/2 report](https://github.com/gracefulinfra/relay-infra/blob/07559ad/conformance/s3/reports/local-b-seaweedfs-4.47-https-h2-2026-09-27.md), relay-infra#6, relay-contracts#8 |
| P0-08  | This report, the [cost model](cost-model.md), and ADR 0005 accepted                                                                                                                                                                         | [reports/](.)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Demonstration value versus commercial ROI

These are separate, and only the first is claimed.

- **Demonstration value (claimed).** Phase 0 showed a provider-neutral platform that runs from GitOps on
  one laptop, a storage contract checked by a conformance suite, and a restore rehearsal with no manual
  steps. Phase 1 turns this into the pitch's strongest demo: a two-show publish-and-correct workflow
  with permanent GUIDs, approved release manifests, feeds and media served without the API, and a
  tested restore (review report, recommendation 3).
- **Commercial ROI (not claimed, and negative on the evidence).** In the pitch's equation, time saved is
  unmeasured (D5) and contribution margin is 0 (D1). For a real 2-show pilot, Relay's known
  infrastructure alone ($191–$318 a month, before edge, control plane, and people) exceeds the vendor
  stack ($72–$128 a month, operations included). At about 63 people-hours a month on top, **a real
  network should buy** (ADR 0005). Nothing in Phase 1 can change this, because synthetic traffic and
  fictional shows cannot measure producer time or audience revenue.

## Cost summary

Full model: [cost-model.md](cost-model.md). All figures are per month.

| Scenario                       | Known cash  | Unknown (not zero)              | People hours | Main driver                          |
| ------------------------------ | ----------- | ------------------------------- | ------------ | ------------------------------------ |
| Portfolio demo (laptop)        | **$0**      | none                            | 43           | Owner time                           |
| 2-show pilot, 10k downloads    | $191–$318   | edge/CDN, control plane, people | 63           | Three always-on nodes; egress on S3  |
| 100k downloads (pitch example) | $245–$1,635 | edge/CDN, control plane, people | 140          | Egress: $1,128 at $0.09/GB, $0 on R2 |

Engineering and operations effort is carried as hours. For the demo, it is the whole budget: **43
hours a month, all of it owner time, $0 cash**. Anything that would need spend (a managed provider, a
hosted transcription API, a paid CDN) needs an explicit owner approval first, as the budget is $0.

## Phase 1 scope

**In scope: P1-01 to P1-20, at demo scale, locally.** No prompt is dropped, so `00-INDEX.md` is
unchanged. The $0 budget sets these constraints on how prompts are satisfied:

| Prompt       | Constraint under the $0 budget                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-01, P1-12 | Blocked until P0-04 PR 2 merges (condition 1)                                                                                                                                                     |
| P1-05        | Blocked until P0-05 PR 3 merges (condition 2)                                                                                                                                                     |
| P1-07        | The hosted adapter is built and contract-tested against a recorded or mock provider. A real call needs a free tier or an owner-approved spend. The self-hosted faster-whisper path is the default |
| P1-11        | Local edge only (`*.localtest.me`). The CDN adapter is documented and not deployed. There is no public domain                                                                                     |
| P1-18        | Backups go to a second local target. That tests restoration, **not** failure-domain independence (P1-18 says so). An off-laptop copy needs a free tier or approved spend (see prerequisites)      |
| P1-20        | Feed validators that need a public URL need a temporary tunnel or are recorded as not run (see prerequisites)                                                                                     |

**Narrow fallback (if the tripwire fires).** Keep the publish-and-correct spine: P1-01 to P1-06,
P1-08 to P1-11, P1-15, P1-18, and P1-20. Defer to Phase 2 with their IDs kept: P1-07's hosted
adapter (keep manual upload and self-hosted), P1-13's transcript review screen, P1-14 beyond one show
page with the player, P1-16 (import), P1-17 (analytics), and the non-blocking parts of P1-19. Record
the deferrals in `00-INDEX.md` and `docs/follow-ups.md`, not by deleting requirements.

Phases 2 and 3 are **gated options**, not commitments (review report, recommendation 1). The P1-20 gate
re-runs this budget check.

## Local resource budget

The reference machine is an Apple Silicon Mac with 10 CPUs and 16 GB RAM. The Docker Desktop VM has
7.75 GiB (P0-05 owner decision).

| Resource             | Budget                            | Measured or allotted                                                                                                    |
| -------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Node memory (anon)   | **≤ 7.0 GiB**, leaving headroom   | Platform through P0-05 PR 2: **4.4 GiB measured**. Observability (P0-05 PR 3): allot ≤ 1.0 GiB, **pending measurement** |
| Relay apps (Phase 1) | ≤ 1.0 GiB together                | api with River, dispatcher, edge, site, admin at single replicas. Measured per prompt and added to `laptop-profile.md`  |
| One heavy job        | ≤ 1.0 GiB, serial (parallelism 1) | faster-whisper `small` int8 or one ffmpeg encode. The P1-07 benchmark confirms or adjusts the size                      |
| Disk for object data | ≤ 100 GB in the Docker VM         | The demo scenario reaches about 65 GB after 12 months, mostly WAV masters. Seed data (P1-15) should use short clips     |
| `make up` (cold)     | ≤ 10 minutes (benchmark)          | 4m 56s at P0-05 PR 2; 10m 12s in the P0-07 run with a local git server. Re-measure after each Phase 1 package           |
| Clusters at once     | 1                                 | P0-07 runs `relay` and `relay-b` one after the other                                                                    |

The allotments add up to 7.4 GiB, above the 7.0 GiB budget, so something has to give if every
allotment is used in full. The first levers are observability retention and Keycloak's heap. The
second is running observability only on demand. If the platform still can't fit, the tripwire fires.

## Unresolved external-access prerequisites

None of these block P1-01. Each is needed later and has no answer yet.

| Prerequisite                                       | Needed by                       | Status and $0 path                                                                                                                                    |
| -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GHCR `read:packages` token for private image pulls | P1-01 (first app chart)         | Mechanism exists (P0-05 `GHCR_TOKEN` → `ghcr-pull`). The owner must create the token locally; the current `gh` token lacks the scope                  |
| Hosted transcription provider and API key          | P1-07                           | **Unresolved.** P1-07 asks the owner to choose. $0 path: a free tier or a mock only                                                                   |
| An off-laptop backup target                        | P1-18                           | **Unresolved.** $0 path: a free object-storage tier (for example R2's 10 GB) for encrypted database backups only. Needs owner approval of the account |
| A public HTTPS URL for feed validators             | P1-20 (P1-10 runs local checks) | **Unresolved.** $0 path: a temporary tunnel for the validation run, or record the public validators as not run                                        |
| CC-licensed source feeds, with licences verified   | P1-15, P1-16                    | Public, no account. Licence evidence is recorded per feed in P1-15                                                                                    |
| Email delivery for Keycloak (verification, reset)  | P1-02                           | Local mail catcher. No external SMTP in Phase 1                                                                                                       |
| Two real providers (provider-a/b)                  | P3-08 at the latest             | **Deferred** by the $0 budget. Provider portability stays unproven until then                                                                         |
| Stripe test account, YouTube API project           | P3-02, P2-09                    | Not Phase 1. Re-check at P1-20                                                                                                                        |

## Risks carried into Phase 1

From pitch §10. The owner of every risk is **@lafronzt**, the only person on the project. The prompt
column says where the mitigation is implemented and checked.

| #   | Risk (pitch §10)                                | Phase 1 exposure                                                        | Mitigation                                                                                                                                                                        | Checked in          |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | Rebuilding an adequate commercial product       | **High.** Commodity rows R1, R4, R6, R8–R10 are rebuilt for parity only | Build the differentiators first (R2, R3, R11, R12). The tripwire and narrow fallback above. ADR 0005's "evidence that would change the decision" is re-checked at P1-20           | P1-20               |
| 2   | Feed or migration failure loses audience access | Medium: only fictional and CC feeds, no real audience                   | Permanent GUIDs (rule 4, ADR 0006). Snapshot feeds served from object storage. P1-16 GUID preservation, 301 rehearsal, and catalog comparison                                     | P1-10, P1-16, P1-20 |
| 3   | Infrastructure overwhelms the product team      | **High.** A team of one, 10 h/week, a 7.75 GiB laptop                   | The local resource budget above. Keep the stack at P0-05's services with no additions. Tested restores (P0-07, P1-18). No paid support at $0, so upgrades follow Renovate, weekly | Each PR, P1-18      |
| 4   | Cloud portability exists only on paper          | **High.** Only a local rehearsal exists                                 | Label it as a local rehearsal everywhere (ADR 0008). Re-run `make portability` after apps land. A real provider-a/b run needs budget, and it is due by P3-08                      | P1-18, P3-08        |
| 5   | Video costs grow faster than revenue            | None in Phase 1 (audio only)                                            | Three renditions at most, retention limits, and cost per viewed hour from this model. Video is staged to P2-01                                                                    | P2-01, P2-11        |
| 6   | Comments create abuse or remain empty           | None in Phase 1                                                         | Moderation queue, reporting, rate limits, and appeals are Phase 2 (P2-06, P2-07)                                                                                                  | P2-11               |
| 7   | AI output introduces factual or rights errors   | Medium: machine transcripts in P1-07                                    | Rule 6: transcripts stay `unapproved` until approved. Masters retained. The manual upload fallback. An optional transcription failure never blocks a release (review report)      | P1-07, P1-09, P1-13 |
| 8   | Analytics overstates audience or ad performance | Medium: P1-17 counts downloads from synthetic traffic                   | Build to IAB v2.2 and never claim certification. Trusted-proxy client IPs (P0-02 finding). Metric families never sum (rule 7). Label synthetic traffic in every report            | P1-17, P1-20        |
| 9   | Ad insertion disrupts timing or caching         | None in Phase 1                                                         | Clean masters are retained by ADR 0006. DAI is a mock adapter in P3-05                                                                                                            | P3-05, P3-08        |
| 10  | Premium access leaks or revocation disappoints  | Low: nothing premium in Phase 1, but origins must already be private    | Private origins and approved-asset-only edge routes (P1-11). Signed, expiring URLs and fail-closed entitlement snapshots in P3-03/P3-04                                           | P1-11, P1-19        |
| 11  | Security or dependency failures expose data     | Medium: public repos, one maintainer                                    | Staff MFA (Keycloak TOTP, done), show-scoped RBAC (P1-02), encrypted backups, secret rotation drill, pinned and signed images, restricted workers                                 | P1-02, P1-19        |

## Evidence limits

- **Synthetic checks don't establish production availability or cross-provider portability.** P0-07
  ran two local environments on one laptop, both on SeaweedFS. The S3 contract has been checked
  against one implementation only.
- Timings and memory figures come from one reference machine. The compute factors in the cost model
  are assumptions until P1-06, P1-07, and P2-01 benchmark them.
- The vendor comparison is a desk evaluation of documentation and list prices on 2026-09-26 (P0-03).
  Only Castopod was run.
- There is no audience, revenue, or producer-time measurement (D1, D5). Nothing here is a commercial
  claim.
