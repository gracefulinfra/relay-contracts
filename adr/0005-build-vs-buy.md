---
status: proposed
date: 2026-09-26
decision-makers: "@lafronzt (project owner)"
prompt: P0-03
---

# Build vs buy: custom Relay, borrowing from Castopod and the vendor market

## Context and Problem Statement

Pitch §9 asks for "a fair comparison between an integrated vendor, an open-source base with customization, and
the proposed custom platform", using the **same** editorial, moderation, migration, and support requirements for
each. P0-02 ([Castopod evaluation](../evaluations/castopod.md)) and P0-03 ([vendor desk
evaluation](../evaluations/vendors.md)) supply the evidence. This ADR records the comparison and a proposed
decision. Its status stays **`proposed`** until the P0-08 gate finalizes it.

The P0-03 prompt names this file `adr/0003-build-vs-buy.md`. Number 0003 was already used by the P0-01 bootstrap,
and P0-08 refers to the build-vs-buy ADR as **0005**, so it lives here.

Relay is a **portfolio project** (DECISIONS D1, D5). There is no network, no revenue, and no producer-time
measurement. That changes how the pitch's decision equation evaluates, and this ADR says so explicitly rather than
borrowing a business case it can't support.

## Decision Drivers

- The non-negotiable architecture rules in the [conventions](../../prompts/01-CONVENTIONS.md), especially rule 1
  (no proprietary runtime), rule 2 (media and feeds survive an API outage), rule 5 (immutable, versioned masters),
  rule 6 (AI output is a draft until approved), and full export (P1-20).
- The pitch's differentiators (§4): the release package with approvals, the connected archive, the direct
  audience relationship with moderation, and verifiable ownership and portability.
- **Strategic value for a portfolio project means demonstrating the architecture.** The deliverable is evidence
  that a provider-neutral, GitOps-deployed, portable podcast platform can be designed, built, operated, and moved.
  An option that hides that architecture behind a vendor contract delivers close to none of this value, however
  good the product is.
- Honesty about the counterfactual. For a real 2-show network, buying would very likely win on cost (see below).
  The ADR must say that, not obscure it.

## Considered Options

- **(a) Integrated vendor.** The most representative buy combines a self-serve host with the audience platform its
  vendor officially integrates with. The reference stack is **Captivate or Transistor for hosting and Ghost for
  membership and comments**, both of which have official Ghost integrations. **Omny Studio** is the enterprise
  variant. Destinations (Apple, Spotify, YouTube) are the same in every option.
- **(b) Castopod-based.** Fork and extend Castopod 1.15.x (AGPL-3.0), or its v2 plugin API, to close the Relay
  gaps.
- **(c) Custom Relay.** The six-repo Go/TypeScript platform described in the prompt series, borrowing Castopod's
  ideas (not its code) and the vendor patterns identified in P0-03.

## Same requirements, three options

Scores: **Meets** · **Partial** · **Gap** (not documented or not possible without building it) · **Planned** (in
the Relay prompt series, not yet built). Evidence IDs point into [`vendors.md`](../evaluations/vendors.md#sources)
and [`castopod.md`](../evaluations/castopod.md#evidence-index).

| #   | Requirement (source)                                                                           | (a) Integrated vendor                                                                                                              | (b) Castopod-based                                                                 | (c) Custom Relay                                                    |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| R1  | Multi-show network with show-scoped roles (P1-02)                                              | **Meets.** Captivate network and podcast roles `[CV2]`; Transistor per-show invites `[TR2]`                                        | **Meets** (W-RBAC)                                                                 | Planned (P1-02)                                                     |
| R2  | Approval-gated release with a release manifest; AI output is a draft (rules 5–6, P1-09)        | **Gap.** No vendor documents an approval step or release record. Ghost contributor drafts only cover the website `[GH4]`           | **Gap** (no approval gate, no manifest)                                            | Planned (P1-09)                                                     |
| R3  | Corrections: permanent GUIDs, versioned and checksummed masters (rules 4–5)                    | **Partial.** GUID handling is not documented as a guarantee; replacement semantics undocumented                                    | **Partial.** GUIDs are stable, but masters are overwritten in place (W-CORR-AUDIO) | Planned (P1-04, P1-09)                                              |
| R4  | Import and migration with GUID preservation and 301 (P1-16, P3-07)                             | **Meets** for import and redirect `[TR9][CV9][AC10]`                                                                               | **Partial.** Namespace tags dropped, no rollback, no 301 (W-IMPORT)                | Planned (P1-16)                                                     |
| R5  | Comments with a moderation queue, reporting, and appeals (P2-06, P2-07)                        | **Partial.** Ghost has comments and reporting, but no appeals `[GH5]`; hosts have none documented                                  | **Partial.** ActivityPub comments, delete-only moderation                          | Planned (P2-06, P2-07)                                              |
| R6  | Video: HLS renditions on the owned site, RSS video, Apple where possible (P2-01, P2-02)        | **Meets** for hosting. Captivate is an Apple HLS partner `[CV3]`; Omny emits `alternateEnclosure` `[OM5]`                          | **Gap.** Audio only (W-VIDEO)                                                      | Planned; Apple HLS is **not available** to a self-built host `[X3]` |
| R7  | Transcripts: generated, human-approved, in the feed, searchable (P1-07, P2-03)                 | **Partial.** Generated and in the feed `[CV4][TR5]`; no approval state; search only on vendor sites                                | **Partial.** Upload only                                                           | Planned (P1-07, P2-03)                                              |
| R8  | Analytics: IAB v2.2-aligned, metric families kept separate (rule 7, P1-17, P2-10)              | **Meets / Partial.** Captivate and Omny are certified v2.2 `[X1]`; owned-site and destination metrics sit in separate vendor silos | **Partial.** v2.0 self-declared and spoofable (W-ANALYTICS)                        | Planned; aligned, never certified                                   |
| R9  | Private and premium feeds with signed, expiring media URLs (P3-03, P3-04)                      | **Meets.** Omny signed per-member feeds `[OM7]`; Captivate and Transistor private feeds `[CV6][TR1]`                               | **Gap.** Media URL is public and unsigned (W-PREMIUM)                              | Planned (P3-03, P3-04)                                              |
| R10 | Sponsor records plus a DAI adapter (P3-01, P3-05)                                              | **Meets** for DAI `[CV8][OM8][AC8]`; sponsor fulfilment records undocumented                                                       | **Gap**                                                                            | Planned (mock partner only)                                         |
| R11 | Full versioned export: records, GUIDs, revisions, rights, manifests, checksummed media (P1-20) | **Gap.** Only RSS plus 301 everywhere; Ghost JSON without media `[GH7]`; Acast loses analytics after redirect `[AC10]`             | **Gap** (W-EXPORT)                                                                 | Planned (P1-20)                                                     |
| R12 | Feeds and media keep working when the application is down (rule 2)                             | **Opaque.** It is the vendor's SLA, and Relay can't test or control it                                                             | **Gap.** PHP sits on the media hot path (W-DELIVERY)                               | Planned (P1-10, P1-11)                                              |
| R13 | No proprietary runtime; demonstrable move between providers (rule 1, P0-07, P3-08)             | **Gap by definition.** The platform is the vendor                                                                                  | **Partial.** Self-hostable, but MariaDB, file sessions, and no Helm chart          | Planned (P0-05–P0-07)                                               |
| R14 | Network-controlled domains for site, feeds, and media (pitch §4)                               | **Partial.** Custom website domains are common; custom feed domains only on Acast Pro `[AC12]`                                     | **Meets** (self-hosted)                                                            | Planned                                                             |
| R15 | Support and operations: on-call, backups, upgrades (pitch §9)                                  | **Meets.** Vendor-operated                                                                                                         | **Gap.** You operate a PHP/MariaDB app plus your AGPL fork                         | Planned (P1-18). Operating cost is carried by the project           |

Summary. Option (a) meets most of the **commodity** rows (R1, R4, R6, R8–R10, R15) today. It has gaps exactly
where the pitch places Relay's differentiation: R2, R11, R12, R13. Option (b) starts ahead on R1, R5, and R14, but
its gaps (R2, R3, R6, R9, R11, R12) are in Castopod's core, so closing them means rewriting the fork in a stack
Relay does not use (P0-02). Option (c) meets nothing yet. Every row is a planned, gated prompt, and the gaps that
define the pitch are only closed by (c).

## The pitch's decision equation (§9)

`time saved + attributable incremental contribution margin + strategic value of control`
**>** `full ongoing cost + migration cost + opportunity cost`

| Term                                         | (a) Integrated vendor                                                                                                          | (b) Castopod-based                                                           | (c) Custom Relay                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Time saved                                   | Not measured (D5). Likely highest in the short term, since nothing is built                                                    | Not measured                                                                 | Not measured. Any workflow benefit is **hypothetical** for a portfolio project                                                                                                 |
| Attributable incremental contribution margin | **0.** No network, no revenue (D1)                                                                                             | **0**                                                                        | **0.** Stripe and DAI are demonstrated in test mode against a mock partner only (A11)                                                                                          |
| Strategic value of control                   | **≈ 0 for this project.** Demonstrates configuration, not architecture. Rules 1, 2, and 5 cannot be shown                      | **Low.** Demonstrates operating and patching someone else's PHP/AGPL core    | **High, and it is the project's purpose.** Demonstrates provider-neutral delivery, portability (P0-07), release manifests, and export                                          |
| Full ongoing cost                            | **Lowest and known.** A 2-show network costs $19–$64/mo at list price `[TR1][CV1][BE1]`, plus Ghost $29/mo. Omny not published | Infrastructure plus maintaining an AGPL fork (security patches, v2 upgrades) | Infrastructure plus the engineering and operations effort. Pitch illustration: ~12–15 engineer-months for discovery plus pilot. Portfolio: owner's time. **P0-08 models this** |
| Migration cost                               | Low in, **high out.** No documented full export (R11)                                                                          | Low in (P0-02 import worked), high out (W-EXPORT)                            | Build P1-16 import and P1-20 export. Exit cost is low by design                                                                                                                |
| Opportunity cost                             | Low                                                                                                                            | Medium: effort goes into a codebase that isn't reusable                      | **High in calendar time.** Every hour here isn't spent elsewhere                                                                                                               |

**Reading the equation honestly.**

- **For a real 2-show network**, the left side of (c) is unproven (no time savings are measured and the margin is
  0), while the right side is certain and large. On today's evidence, **(a) wins**: buy a certified host with
  Apple HLS (for example Captivate) and pair it with Ghost for membership and comments. The pitch warns against
  building because "storing MP3s is expensive", and this evaluation confirms that hosting is a commodity.
- **For this portfolio project**, the only non-zero benefit term is **strategic value**, and here it means
  demonstrating the architecture. (a) scores about zero on it by construction, and (b) scores low because the
  demonstration would be of Castopod, not of Relay. The inequality holds for (c) only because the project's
  purpose is the demonstration. That is a legitimate reason for this project, and it would **not** be a reason for
  a network.

## Decision Outcome

Proposed option: **"(c) Custom Relay"**. It is the only option that can satisfy R2, R11, R12, and R13, which are
the requirements that make Relay a distinct proposal rather than a re-hosting exercise. For a portfolio project, the
strategic value term in §9 is the demonstration of that architecture.

Scope follows from the evaluations, so the build targets the differentiators rather than competing with commodity
hosting:

- **Build:** the release package and approvals, versioned masters, snapshot feeds and media served from object
  storage, export, portability, the connected archive, and moderation with appeals.
- **Borrow (ideas, not code):** Castopod's analytics filtering and namespace checklist (P0-02). From Omny: signed
  webhooks, audit events, revocable per-member signing keys, and a download-event export. From Captivate and Acast:
  IAB v2.2 filtering details, and redirect-out as a first-class feature.
- **Integrate, don't rebuild:** destinations (Apple via RSS video, Spotify via RSS audio, YouTube via the Data API
  with audit caveats), Stripe, and the DAI partner (mock), all behind adapters.
- **Don't claim:** IAB certification, Apple HLS delivery, or Spotify video from an external host. Each needs a
  commercial partnership that a self-built host does not have `[X1][X3][SP12]`.

### Consequences

- Good, because every architecture rule and every pitch differentiator can be demonstrated and tested (R2,
  R11–R13).
- Good, because Relay's contracts can copy proven vendor shapes (signed webhooks, per-member keys, event export)
  instead of inventing them.
- Bad, because (c) has the highest opportunity cost and zero working features today. Commodity features (R1, R4,
  R6, R8–R10) have to be rebuilt just to reach parity with a $19/mo plan.
- Bad, because some real-world capabilities can't be reached by a self-built host at all: Apple HLS, IAB
  certification, programmatic demand, and Spotify video monetisation. Relay's video story is weaker than
  Captivate's or Omny's.
- Neutral, because the counterfactual is recorded. If Relay's framing ever changed to serving a real network, this
  ADR already argues for (a).

### Confirmation

- P0-08 confirms or rejects this ADR, using the cost model and portability evidence from P0-05 to P0-07.
- Each Phase 1–3 gate re-checks the R-table rows its prompts claim. A row may move to **Meets** only with the
  evidence the prompt's acceptance criteria require.

## Evidence that would change the decision

Toward **(a) integrated vendor**:

- The project's purpose changes from demonstration to operating a real network, so the margin and time-saved
  terms become measurable and strategic value no longer dominates.
- A vendor documents an **approval-gated release with a durable release record** (R2) **and** a **full,
  versioned, GUID-anchored export including media** (R11). Omny is the most likely candidate, given its audit
  events and event export.
- P0-05 to P0-07 show that portability can't be demonstrated within the Phase 0 budget, which removes the main
  strategic value term for (c).

Toward **(b) Castopod-based**:

- Castopod v2 (stable) ships plugin hooks for **storage and delivery** (so media and feeds can be served without
  the app), **media versioning**, and an **export**. That would close R3, R11, and R12 without a core fork.
- Relay decides it is acceptable for the server to be AGPL-3.0, which changes the licensing trade-off in P0-02.

Toward **narrowing (c)** (P0-08 "narrow scope"):

- The P0-08 cost model shows Phase 1 is unaffordable within the owner's time budget. The fallback is to build R2,
  R11, and R12 around a bought host (vendor webhooks and API as the ingest path). That is a hybrid of (a) and (c),
  and it depends on the thin vendor export surface documented in P0-03.

## Pros and Cons of the Options

### (a) Integrated vendor

- Good, because commodity features are available today, cheaply, from certified and Apple-partnered vendors.
- Good, because operations, on-call, and upgrades are the vendor's job.
- Bad, because no vendor documents approvals, release manifests, or full export. Offline delivery is an opaque SLA.
- Bad, because integration surfaces are thin (Acast: one webhook; Castos: no webhooks; Captivate: API by request),
  so a buy-plus-extend hybrid would be fragile.
- Bad, because for this project it demonstrates nothing about the architecture.

### (b) Castopod-based

- Good, because it is open source and self-hostable, has strong namespace and ActivityPub support, and a working
  multi-show RBAC.
- Bad, because its core conflicts with rules 2 and 5 and lacks approvals and export. Fixing that means rewriting
  the fork.
- Bad, because modifying and hosting it triggers AGPL obligations, and it uses a stack (PHP, MariaDB) that Relay
  does not.

### (c) Custom Relay

- Good, because it is the only option that can meet R2 and R11–R13 and demonstrate portability.
- Good, because its scope can be focused on the differentiators, borrowing and integrating everything else.
- Bad, because it has the highest cost and risk, and some capabilities are commercially out of reach.

## More Information

- Evidence: [evaluations/vendors.md](../evaluations/vendors.md) (P0-03) and
  [evaluations/castopod.md](../evaluations/castopod.md) (P0-02).
- Pitch §3 (landscape), §4 (differentiation), §9 (economics).
- [DECISIONS](../../prompts/02-DECISIONS.md) D1, D5, A5, A8, A11 and the research findings on Apple HLS, YouTube
  quotas, and IAB v2.2.
- Revisit at **P0-08** (finalize), and whenever a vendor in `vendors.md` documents R2 or R11. Vendor docs change
  often, so re-check the matrix before the P3-08 final report.
