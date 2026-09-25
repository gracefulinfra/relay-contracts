---
status: accepted
date: 2026-09-25
decision-makers: "@lafronzt (project owner)"
prompt: P0-01
---

<!--
ADR-0002 is a verbatim copy of the planning workspace's prompts/02-DECISIONS.md as of 2026-09-25.
It is not in MADR format; it records the decisions made before the prompts were written. Do not edit it:
change a decision by adding a new ADR that supersedes the relevant row. The review report linked at the
end lives in the planning workspace (reviews/2026-09-25-review.md), not in this repo.
-->

# Relay: Decisions Log

Decisions made before the prompts were written. **(U)** means the user decided in the planning Q&A.
**(D)** means a default was chosen by the prompt author, and the reason is given. Change a (D) decision freely
by editing this file and adding an ADR in `relay-contracts/adr/`. Change a (U) decision only
after confirming with the project owner.

## Project framing

| # | Decision | Source |
| --- | --- | --- |
| D1 | Portfolio project. Uses fictional shows plus Creative Commons feeds; there is no real network | U |
| D2 | Prompts cover all phases 0–3; later phases carry less detail | U |
| D3 | Prompts are agent-executable (Claude Code) and double as human-readable specs | U |
| D4 | Working name **Relay**; repos `relay-*` | U |
| D5 | Phase 0 = technical spikes + Castopod and vendor evaluation; no producer-time measurement | U |

## Architecture

| # | Decision | Source |
| --- | --- | --- |
| A1 | Go API + TypeScript frontends | U |
| A2 | Six repos: contracts, api, media-workers, site, admin, infra | U |
| A3 | Astro public site + React (Vite) admin | U |
| A4 | GitHub + Actions + GHCR | U |
| A5 | Provider-neutral: no named cloud. Envs are `local` (k3d), `provider-a`, `provider-b` overlays | U |
| A6 | Object storage = S3 API. SeaweedFS locally and self-hosted; managed S3 bucket in cloud. **Rook-Ceph from the pitch is dropped** | U |
| A7 | River (Postgres) for durable dispatch + Argo Workflows for heavy media execution | U |
| A8 | Transcription: faster-whisper (self-hosted) and a hosted provider behind one adapter, plus manual upload | U |
| A9 | Keycloak for staff **and** listeners (separate realms); entitlements live in the app | U |
| A10 | Three access tiers: **anonymous** (listen, read, search), **free account** (comment, follow, notifications), **paid** (ad-free, private feeds, bonus content, extras) | U |
| A11 | Stripe for memberships; DAI = adapter interface + mock partner (no real stitching) | U |
| A12 | Seed data = generated fixtures **and** CC-licensed feed imports | U |
| A13 | Local cluster tool: **k3d**, for its built-in registry and load balancer | D |
| A14 | Go HTTP: stdlib `net/http` routing; `sqlc` + `pgx/v5`; `goose` migrations. These keep the dependency count small and the SQL explicit | D |
| A15 | Show-notes storage: TipTap/ProseMirror JSON as source of truth, rendered to sanitized HTML at publish time, with Markdown export. Gives structured, portable, feed-safe rendering | D |
| A16 | Search: PostgreSQL full-text search first (per the pitch) | D |
| A17 | Resumable upload: tus protocol (`tusd` as Go library) writing to S3. It's an open protocol with mature clients (Uppy) | D |
| A18 | Admin UI: TanStack Router/Query + a headless component library (Radix-based). Accessible primitives, no design-system lock-in | D |
| A19 | Video on site: `hls.js` + custom accessible controls (or Vidstack, if it's still maintained at build time) | D |

## Research findings that shape the prompts (checked 2026-09-25)

- **MinIO's community edition was archived in April 2026.** SeaweedFS is Apache-2.0 and actively maintained,
  and Kubeflow switched to it. Garage is AGPL, and its single-node mode is not recommended for production.
  [bex.co comparison](https://bex.co/blog/2026/07/09/minio-death-garage-seaweedfs-rustfs),
  [InfoQ](https://infoq.com/news/2025/12/minio-s3-api-alternatives/)
- **Castopod** is AGPL-3.0 and actively developed (v2 in progress, with a plugin system).
  [castopod.org](https://castopod.org/), [v2 plugins](https://blog.castopod.org/castopod-first-12-plugins/)
- **River** stores jobs in the same Postgres and supports transactional enqueue, scheduled and periodic
  jobs, and a web UI. [riverqueue.com](https://riverqueue.com/)
- **Argo Workflows 4.1.x** is current (4.1 released 2026-08-11).
  [New features](https://argo-workflows.readthedocs.io/en/latest/new-features/)
- **Envoy Gateway 1.8.x**, with cert-manager's Gateway API integration (`config.enableGatewayAPI=true`).
  [Envoy Gateway + cert-manager](https://gateway.envoyproxy.io/latest/tasks/security/tls-cert-manager/)
- **CloudNativePG**: the official release index lists 1.30.1 and 1.29.3 on September 23, 2026. Evaluate the supported 1.30 line for new deployments; verify the selected release and PostgreSQL compatibility before pinning. Earlier 1.29.1/1.28.3 fixed CVE-2026-44477; those minimum fixes are not current-version recommendations.
  [CNPG releases](https://cloudnative-pg.io/releases/)
- **Keycloak 26.7.x** is a proposed baseline requiring release verification; the linked 26.6 announcement does not verify it. [Keycloak](https://www.keycloak.org/2026/04/keycloak-2660-released)
- **Astro 6** is stable (March 2026) and requires Node 22+. [Astro 6](https://astro.build/blog/astro-6/)
- **Apple Podcasts HLS video (iOS 26.4)** is delivered to Apple via a **partner API** for hosting providers.
  Apple does not support `podcast:alternateEnclosure`. A self-built host should assume **no** access and treat
  Apple video as "standard RSS video enclosure" or "manual".
  [Apple video via RSS](https://podcasters.apple.com/support/3684-video-podcasts),
  [Podnews details](https://podnews.net/article/video-apple-podcasts-details)
- **YouTube Data API**: since 2026-06-01, `videos.insert` has had its own quota bucket (default about 100 uploads a day).
  Uploads from **unaudited projects are forced private**, and audit timing is an external dependency.
  [Quota and compliance audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)
- **IAB Tech Lab Podcast Measurement v2.3** was released for public comment (closed 2026-08-19). v2.2 is the
  finalized baseline. Build to v2.2 and track v2.3 (URL-prefix measurement, enclosure URL changes, IVT).
  Never claim certification. [v2.3 press release](https://iabtechlab.com/press-releases/iab-tech-lab-releases-podcast-technical-measurement-guidelines-v2-3/)
- **Stripe Entitlements**: Features are attached to Products, and `entitlements.active_entitlement_summary.updated`
  fires on change. Stripe recommends persisting entitlements locally.
  [Stripe entitlements](https://docs.stripe.com/billing/entitlements)
- **Transcription engines**: faster-whisper (CTranslate2) is the better server/GPU choice. WhisperX adds
  diarization and alignment. whisper.cpp is best on Apple Silicon and edge devices.
  [Comparison](https://www.promptquorum.com/power-local-llm/local-whisper-stt-comparison-2026)
- **Podcast namespace** tags to support: `podcast:guid`, `podcast:transcript`, `podcast:chapters`,
  `podcast:person`, `podcast:season`/`episode`, `podcast:alternateEnclosure`, `podcast:txt`, `podcast:locked`.
  [podcasting2.org](https://podcasting2.org/docs/podcast-namespace)

## Review clarifications

The 2026-09-25 review preserves all U decisions. Historical research notes are leads, not substitutes for verification against the selected release. Use primary project documentation for maintenance, licenses, versions, API quotas, and standards; mark anything not rechecked as unverified. In particular, the Keycloak 26.6 announcement does not substantiate a 26.7 version claim, and transcription engine performance needs a representative hardware/language benchmark.

Implementation defaults clarified by this review: versioned enclosure URLs; release manifests separate from delivery receipts; fail-closed expiry for private entitlement snapshots; and a local portability rehearsal explicitly distinguished from independent provider/storage validation. Record these defaults in the relevant implementation ADRs before coding. See [review report](../reviews/2026-09-25-review.md).
