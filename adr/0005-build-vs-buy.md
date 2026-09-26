---
status: proposed
date: 2026-09-26
decision-makers: "@lafronzt (project owner)"
prompt: P0-03
---

# Build vs buy: custom Relay core, with vendors as destinations

## Context and Problem Statement

The pitch (§9) asks for a fair comparison of three options against the **same** editorial, moderation, migration,
and support requirements: an integrated vendor, an open-source base with customization, and a custom platform.
P0-02 evaluated Castopod hands-on ([`evaluations/castopod.md`](../evaluations/castopod.md)). P0-03 evaluated ten
vendors from public documentation ([`evaluations/vendors.md`](../evaluations/vendors.md)).

Relay is a portfolio project ([decisions log D1](../../prompts/02-DECISIONS.md)). There's no real network, no
producers whose time can be saved, and no revenue. This ADR states how that changes the pitch's decision equation
rather than pretending it doesn't.

This ADR stays `proposed` until the [P0-08 gate](../../prompts/phase-0/P0-08-gate.md) accepts or rejects it with the
cost model and the P0-05 to P0-07 platform evidence.

## Decision Drivers

- Same requirements for every option (below), derived from the pitch (§2, §4, §5, §7), the architecture rules in
  `01-CONVENTIONS.md`, and the decisions log.
- The pitch's decision equation (§9):
  **time saved + attributable incremental contribution margin + strategic value of control > full ongoing cost +
  migration cost + opportunity cost.**
- For a portfolio project, **strategic value includes demonstrating the architecture**: a provider-portable,
  GitOps-deployed platform with an auditable release workflow is the thing being shown. A vendor subscription
  can't demonstrate that.
- A solo builder's time is the scarcest resource (review report, 2026-09-25). Scope must stay inside what one
  person can operate.

## Requirements used for every option

| #   | Requirement                                                                                                            | Source                            |
| --- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| R1  | Multi-show network with show-scoped roles                                                                              | Pitch §2, §5                      |
| R2  | Editorial approval before publishing, with an immutable release manifest and ready/blocked/published/out-of-sync state | Pitch §4.1, §5; P0-04             |
| R3  | Corrections keep the GUID and original `pubDate`; media versions are immutable, checksummed, and at new URLs           | Conventions rules 4–5; P0-04      |
| R4  | Feeds and media keep working when the application is down                                                              | Conventions rule 2                |
| R5  | Video, including Apple Podcasts video                                                                                  | Pitch §2, §7                      |
| R6  | Transcripts and AI output are drafts until a human approves them                                                       | Conventions rule 6; decision A8   |
| R7  | Comments, follows, and moderation with appeals                                                                         | Pitch §2, §5; decision A10        |
| R8  | Analytics in separate families, built to IAB v2.2, never summed                                                        | Conventions rule 7; decisions log |
| R9  | Premium and private feeds that fail closed and can be revoked                                                          | Decision A10; P0-02 finding       |
| R10 | Sponsorship records and an ad-decision adapter (no real stitching)                                                     | Decision A11                      |
| R11 | Full, versioned export; no proprietary runtime; runs on a second provider                                              | Conventions rule 1; P1-20; P0-07  |
| R12 | Import and migration that keep GUIDs and use 301 redirects                                                             | Pitch §5; P1-16                   |
| R13 | Operable by one person, with a measured resource profile                                                               | Review report, 2026-09-25         |

## Considered Options

- **(a) Integrated vendor.** The best-fit self-serve host (Transistor, Captivate, or Acast class), with Omny Studio as
  the enterprise benchmark, and Ghost where community and memberships are needed. Relay would add only thin glue
  code through the vendors' APIs.
- **(b) Castopod-based.** Run or fork Castopod 1.15.x (AGPL-3.0) and extend it through v2 plugins or source changes.
- **(c) Custom Relay.** Build the planned modular monolith and platform. Borrow Castopod's feed and analytics
  knowledge, and treat Spotify, YouTube, and Apple as destinations behind adapters.

## Comparison on the same requirements

Key: **Met** = documented or demonstrated. **Partial** = some of it, with a documented gap. **Build** = would have to
be built on top. **Gap** = not achievable within that option. The evidence is in the linked evaluations.

| #   | (a) Integrated vendor                                                                                                       | (b) Castopod-based                                                               | (c) Custom Relay                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| R1  | **Met.** Captivate, Omny, and Acast document show- or network-scoped roles                                                  | **Partial.** Per-podcast roles work; no network entity (P0-02)                   | Build (P1-02, P1-03)                                                                        |
| R2  | **Build.** No vendor documents an approval step or a release record; all are role-based only                                | **Build.** No approval step or manifest (P0-02)                                  | Build (P0-04, P1-09); this is the pitch's core differentiator                               |
| R3  | **Partial.** GUIDs are kept; versioning and URL rules for replaced media are undocumented                                   | **Gap.** Replacing media overwrites it in place; slug changes break URLs (P0-02) | Build (P0-04 ADR 0006, P1-04, P1-11)                                                        |
| R4  | **Met.** Vendors run their own CDNs (their uptime, not Relay's)                                                             | **Gap.** Enclosures are app routes (P0-02)                                       | Build (P1-10, P1-11 snapshots to object storage)                                            |
| R5  | **Met.** Apple HLS partners: Acast, Omny, Captivate, and Transistor (beta)                                                  | **Gap.** Audio only                                                              | **Partial.** Video via RSS and HLS on the site; no Apple HLS partner access (decisions log) |
| R6  | **Partial.** Transcripts are editable; no approval state                                                                    | **Partial.** Upload only; no approval state                                      | Build (P1-07)                                                                               |
| R7  | **Partial.** Only Spotify (in-app) and Ghost (a separate product) have comments; no moderation queue or appeals among hosts | **Partial.** ActivityPub comments; no queue or appeals (P0-02)                   | Build (P2-06, P2-07)                                                                        |
| R8  | **Partial.** IAB v2.2 certified (Acast, Captivate, Omny); the families aren't separated as Relay requires                   | **Gap.** v2.0 methodology; counts can be faked (P0-02)                           | Build to v2.2 without claiming certification (P1-17, P2-10)                                 |
| R9  | **Met.** Private feeds on every host; revocation behaviour not verified                                                     | **Gap.** Premium media is publicly reachable (P0-02)                             | Build (P3-03, P3-04)                                                                        |
| R10 | **Met.** Acast, Omny, Captivate, Transistor, and Castos have dynamic ads (more than R10 asks)                               | **Gap.** Undocumented                                                            | Build, adapter plus mock only (P3-05)                                                       |
| R11 | **Gap.** Export is RSS plus a 301 redirect; analytics, comments, and subscribers are mostly locked in                       | **Partial.** Self-hostable, but no export and a MariaDB/PHP runtime (P0-02)      | Build (P1-20 export, P0-07 portability)                                                     |
| R12 | **Met.** Every host documents a 301 redirect in; most document one out                                                      | **Partial.** Import works; no redirect set; item tags lost (P0-02)               | Build (P1-16)                                                                               |
| R13 | **Met.** The vendor runs it                                                                                                 | **Partial.** One Compose stack, but a second runtime alongside Relay             | **At risk.** The full stack must fit a laptop (P0-05, P0-08)                                |

### Cost for the same pilot (2 shows, video, about 10k downloads, 3 seats, 1 private feed)

| Option | Published cost                                                                                                                                                             | Engineering effort (solo)                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| (a)    | $19 plus video add-on (Captivate), $49 (Transistor), $50 (Acast), or $99 (Castos) a month. Omny unpublished. Plus Ghost at about $58 a month for community and memberships | Low for hosting. R2, R3, and R11 would still need a custom editorial and export layer        |
| (b)    | Self-hosted and free (AGPL-3.0) plus infrastructure; managed €9.96 to €96 a month                                                                                          | High. Closing R3, R4, R9, and R11 means rewriting Castopod's core in PHP and MariaDB (P0-02) |
| (c)    | Infrastructure only (the P0-08 cost model will quantify it)                                                                                                                | Highest. Phase 1 is the first useful deliverable; later phases are gated options             |

## Applying the decision equation

| Term                            | (a) Vendor                                                                                        | (b) Castopod                                                                                                       | (c) Custom Relay                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Time saved                      | None to measure: there are no producers (D1, D5)                                                  | None to measure                                                                                                    | None to measure. Simulated workflows can illustrate but not prove savings (review report)     |
| Incremental contribution margin | $0; there's no revenue (D1)                                                                       | $0                                                                                                                 | $0. Stripe and DAI run in test or mock mode only                                              |
| Strategic value of control      | **Low.** It shows vendor configuration, not architecture. Demonstrates none of R2, R3, R4, or R11 | **Low to medium.** Shows operating an existing open-source product; the Relay rules can't be met without a rewrite | **High.** Demonstrating the architecture (R2–R4, R11, portability) is the portfolio's purpose |
| Full ongoing cost               | Low: $49 to $150 a month for the stack                                                            | Medium: running a second runtime                                                                                   | **High:** solo engineering and on-call time, plus infrastructure                              |
| Migration cost                  | Low in, high out (analytics and subscribers stay behind)                                          | Medium                                                                                                             | Low. Seed data and CC feeds only (A12)                                                        |
| Opportunity cost                | Low                                                                                               | Medium                                                                                                             | **High:** months of solo work                                                                 |

For a portfolio project the equation comes down to **strategic value of control compared with ongoing and
opportunity cost**, because time saved and margin are zero for every option. Only option (c) produces strategic
value. That is exactly why the costs must stay bounded: Phase 1 is the first useful deliverable, and later phases
are gated options (review report). Option (c) wins only if the cost side stays inside the budget P0-08 sets.

**For a real network, the same evidence would point the other way.** The vendors already cover R1, R4, R5, R9, R10,
and R12. A self-serve host costs $50 to $100 a month, and time saved and margin would be real, measurable terms.
The rational choice would be to **buy hosting** (a) and build only a thin editorial and export layer (R2, R3, R11)
against the host's API, if the measured workflow gap justified even that. The pitch says this directly: "The custom
option should win on strategic value and measured workflow fit, not an assumption that storing MP3s is expensive."
This ADR doesn't claim otherwise.

## Decision Outcome

Proposed option: **(c) Custom Relay**, scoped as follows:

1. **Build** the parts no vendor documents and that define the portfolio: the editorial workflow with an immutable
   release manifest (R2), versioned immutable media and correction rules (R3), feeds and media that survive an
   application outage (R4), full export (R11), and a demonstrated second provider (P0-07).
2. **Borrow and don't fork** Castopod: its GUID storage, namespace coverage, and privacy-preserving analytics
   model. Target IAB v2.2 with trusted-proxy IP validation instead of Castopod's v2.0 approach (P0-02).
3. **Treat vendors as destinations, not foundations.** Spotify for Creators, YouTube, and Apple get adapters in
   P2-09. Apple video stays a "standard RSS video enclosure" or "manual" (decisions log). YouTube uploads assume
   the quota and forced-private rules until an audit completes.
4. **Don't rebuild commercial ad markets.** Keep the dynamic ad requirement to an adapter plus a mock (A11).
   Sponsorship records are Relay's; ad demand would come from a partner.
5. **Keep Omny Studio as the named benchmark** in portfolio write-ups. Relay's claim is workflow fit and ownership,
   not feature breadth.

### Consequences

- Good, because it demonstrates the architecture the pitch argues for, which no vendor option can do.
- Good, because the release manifest, versioning, and export rules are exactly the gaps found in every vendor and
  in Castopod, so the build targets real differences rather than re-creating commodity hosting.
- Bad, because it is the most expensive option in solo engineering time. Phases 2 and 3 may never be built.
- Bad, because Relay can't match partner-only capabilities: Apple HLS video delivery and certified measurement.
  Portfolio materials must say so plainly.
- Neutral, because the recommendation depends on the portfolio framing. It must not be quoted as evidence that a
  real network should build.

### Confirmation

- P0-08 records `accepted` or `rejected`, using the cost model, the P0-05 resource profile, and the P0-07
  portability evidence.
- Phase gates (P1-20, P2-11, P3-08) recheck whether the build still targets R2, R3, R4, and R11 rather than
  commodity features.

## What evidence would change this decision

- **The platform doesn't fit one person.** If P0-05 or P0-07 show the stack can't run within the laptop budget, or
  portability fails without major manual work, narrow (c) to the editorial, release, and export layer on top of a
  vendor host's API. That hybrid is (a) plus a thin (c).
- **The P0-08 cost model** puts Phase 1 beyond the demonstration budget P0-08 sets.
- **A vendor documents what's missing.** For example, an approval workflow, immutable release records, versioned
  media URLs, and full export through its API: the Omny Management API's audit events are the closest candidate.
  If so, (a) covers R2, R3, and R11, and the portfolio case rests on portability alone.
- **Castopod v2's plugin API** gains hooks for delivery outside the app, versioned media, and approval states,
  making (b) viable without a fork.
- **A real network becomes available.** Time saved and contribution margin become measurable and would likely
  outweigh strategic value. Re-run this comparison with producer measurements, and expect (a) or a hybrid.
- **Apple Podcasts video becomes a hard requirement.** Only partner hosts can deliver it, so that requirement alone
  would favour (a) for video.

## Pros and Cons of the Options

### (a) Integrated vendor

- Good, because hosting, CDN, video (including Apple HLS for partners), private feeds, dynamic ads, and certified
  measurement are available now for $19 to $99 a month.
- Good, because Omny, Transistor, and Ghost expose read/write APIs with webhooks, so a thin custom layer is
  possible.
- Bad, because no vendor documents an approval step or a release record, and export is limited to RSS plus a
  redirect. Analytics history, comments, and subscribers stay with the vendor.
- Bad, because comments and moderation need a second product (Ghost), which splits the audience record.
- Bad, because for a portfolio it demonstrates configuration rather than architecture.

### (b) Castopod-based

- Good, because it is open source, self-hostable, and strong on namespace tags and fediverse comments.
- Bad, because P0-02 found that four load-bearing Relay rules (R3, R4, R9, R11) can't be met without rewriting its
  core in a language and database Relay doesn't otherwise use.
- Bad, because modifying and hosting it carries AGPL-3.0 obligations.

### (c) Custom Relay

- Good, because it targets exactly the gaps shared by every other option (R2, R3, R4, R11).
- Good, because it is the only option that demonstrates provider portability.
- Bad, because it has the highest engineering and operating cost for one person.
- Bad, because it can't offer Apple HLS partner delivery or certified measurement.

## More Information

- Evidence: [`evaluations/vendors.md`](../evaluations/vendors.md) (desk evaluation, checked 2026-09-26),
  [`evaluations/vendors/`](../evaluations/vendors/) (per-vendor citations),
  [`evaluations/castopod.md`](../evaluations/castopod.md) (hands-on, P0-02).
- Related: ADR 0006 (GUID and media versioning, P0-04), the decisions log (D1, A5–A11), and pitch §3, §4, and §9.
- Revisit at the P0-08 gate. After that, revisit at each phase gate, or when any trigger above occurs. Vendor
  facts are true as of 2026-09-26; recheck them before relying on them in a later decision.
