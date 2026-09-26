# Vendor desk evaluation (P0-03)

**Status:** complete · **Prompt:** [P0-03](../../prompts/phase-0/P0-03-vendor-evaluation.md) · **Checked:** 2026-09-26 · **Decision record:** [ADR 0005](../adr/0005-build-vs-buy.md)

## Scope and method

This is a **desk evaluation of public documentation** for every option in pitch §3. It is not a hands-on
procurement: no accounts or trials were opened, no payment details were entered, and no sales team was contacted.
Castopod is the exception: it was run hands-on in [P0-02](castopod.md), and its row reuses that evidence.

- **Vendors.** Pitch §3 lists eight options. Three of them combine two products, and those are split so that each
  cell cites one product. Spotify for Creators and YouTube get separate rows, and so do Beamly and Ghost. Castos +
  WordPress stays one row because it is one integrated product (the Seriously Simple Podcasting plugin syncs to
  Castos hosting). That gives **10 rows**.
- **Citations.** Every cell ends with one or more source IDs, for example `[TR1]`. Each ID resolves to a URL in
  [Sources](#sources), where the date checked is also recorded. All sources were checked on **2026-09-26**.
- **"Undocumented" means the public documentation says nothing.** It does not mean the product lacks the feature.
  A cell reads "undocumented" when the vendor's docs, help center, and pricing page were searched and none of
  them addressed the question. This follows the prompt's rule.
- **Pricing basis.** Prices are USD list prices (EUR where only EUR is published) for the **cheapest plan that
  supports a 2-show network**. Monthly and annual billing are both shown when they differ. When a Relay
  requirement (team roles, DAI, video) needs a higher tier, the cell names that tier too.
- **IAB status** comes from the IAB Tech Lab's own compliant-companies list `[X1]`, not from vendor claims.
  A vendor that says "IAB compliant" but is not on the list is recorded as _compliant (self-declared), not
  certified_.
- **Apple HLS partner status.** Apple's guide `[X3]` requires "a hosting provider that supports video on Apple
  Podcasts", authenticated with an Apple Podcasts Connect API key. The public partner lists are Triton's
  March 2026 announcement `[X2]` plus each vendor's own docs. Apple's own partner search was not machine-readable.
- **Per-vendor research notes** are in [`vendors/`](vendors/), one file per option. They add detail, lock-in risks,
  and notes on pages that failed to load. **Where a note and this matrix differ, the matrix is authoritative.** Its
  cells were rechecked against primary sources, and every cited URL returned HTTP 200 on 2026-09-26.

Legend: **Yes** documented and available · **Partial** documented with a material limit · **No** documented as
unavailable · **Undocumented** docs are silent · **N/A** not applicable to this product type.

## Summary

- **Hosting and publishing is a commodity.** Every hosting vendor documents multi-show accounts, transcripts,
  private feeds, some form of dynamic insertion, and a 301 redirect out. A 2-show network costs $19–$64 a month
  at list price on the self-serve hosts `[TR1][CV1][AC1][CA1][BE1]`. Nothing in the pitch's "hosting" scope is
  a gap in the market.
- **No vendor documents Relay's editorial core.** None of them documents an approval-gated release, a release
  manifest, or a "machine output is a draft until approved" state. Role models control who _can_ publish, not
  whether a release _was approved_. Ghost's Contributor role comes closest: contributors can write drafts but
  cannot publish `[GH4]`.
- **Export is the weakest area everywhere.** Every vendor documents a feed 301 redirect. None documents a
  versioned, GUID-anchored export of records, revisions, and media, which Relay requires for P1-20. The best are
  Ghost (JSON content export, but no media) `[GH7]` and Omny (a raw download-event export add-on) `[OM11]`. Acast
  warns that analytics are lost once the redirect is set `[AC10]`.
- **Apple HLS video needs an Apple partnership.** Captivate, Transistor, Acast, and Omny are partners `[X2]`. For
  Transistor and Acast it is still waitlist or limited beta `[TR3][AC4]`. The P0-02 finding and DECISIONS stand:
  a self-built host gets standard RSS video only `[X3]`.
- **Community lives on audience platforms, not hosts.** Only Spotify, YouTube, Ghost, Beamly, and Castopod
  document listener comments. Of those, only YouTube `[YT6]` and Ghost `[GH5]` document a review queue or
  reporting. None documents appeals, which Relay needs for P2-07.
- **IAB certification is the exception among small hosts.** Acast, Omny/Triton, and Captivate are listed at v2.2
  `[X1]`. Captivate's listing dates from 2024-07-19. Transistor and Castos self-declare compliance `[TR6][CA9]`.

## Matrix

### A. Publishing

| Option                   | Multi-show                                                                                                                                  | Roles / approvals                                                                                                                                                                                    | Video (incl. Apple HLS partner status)                                                                                                                                 | Transcripts                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transistor**           | **Yes.** Unlimited podcasts on every plan `[TR1]`                                                                                           | **Partial.** Owner / Admin / Member / Analytics, invited per show. Approval workflow undocumented `[TR2]`                                                                                            | **Partial.** Says it is "one of Apple's approved hosting partners for HLS video", but the feature is "Coming Soon" with a waitlist `[TR3][X2]`                         | **Yes.** AI transcripts with speaker detection and an editor, or upload your own. Export as TXT/SRT/VTT/JSON/HTML. Added to the RSS feed `[TR4][TR5]`                       |
| **Captivate**            | **Yes.** Unlimited public podcasts, downloads pooled across shows `[CV1]`                                                                   | **Partial.** Network roles (Viewer, Marketer, Publisher, Manager, Admin) plus podcast roles (Viewer, Publisher, Producer, Admin). No role requires approval `[CV2]`                                  | **Yes.** Apple HLS via an Apple Podcasts Connect API key. Apple reviews each show (up to 2 weeks). Networks pay $12/mo per video podcast `[CV3][X2]`                   | **Yes.** SRT upload, manual entry, or Descript, published as `podcast:transcript`. Auto-transcription via Captivate Assistant costs $1/hour `[CV4][CV5]`                    |
| **Omny Studio**          | **Yes.** Organization → network → program hierarchy `[OM1][OM2]`                                                                            | **Partial.** Checkbox permissions at organization, network, or program level. Clip visibility Private / Unlisted / Restricted / Public, with scheduling. Approval workflow undocumented `[OM2][OM3]` | **Yes.** Optional feature enabled by support. Submits to Apple. `podcast:alternateEnclosure` with MP4 and HLS. Initial Apple HLS partner `[OM4][OM5][X2]`              | **Yes.** Machine ($0.07–0.24/min) or human ($1.50/min), editable, WebVTT/SRT export, `podcast:transcript` tag. Must be activated `[OM6]`                                    |
| **Acast**                | **Yes.** Unlimited shows on paid plans (Starter: 1 show) `[AC1]`                                                                            | **Partial.** Owner or Admin decides each user's access to each show. Team management needs Pro. Approval workflow undocumented `[AC1][AC3]`                                                          | **Partial.** Apple video "is currently in a limited beta and is only available to selected creators". Video plan is $50/mo. Initial Apple HLS partner `[AC4][AC1][X2]` | **Partial.** On demand, paid plans only, 8 languages. Acast "doesn't currently offer a way to attach transcripts directly to episodes", so they are not in the feed `[AC5]` |
| **Spotify for Creators** | **Yes.** Manage hosted and externally hosted shows in one account `[SP2]`                                                                   | **Partial.** Access levels per tab (Episodes, Analytics, Monetize, Comments, Settings). Permissions apply to **all** shows in the account. No approval workflow `[SP3]`                              | **Partial.** Video plays on Spotify only; RSS carries audio only elsewhere. Not an Apple HLS partner `[SP4][X2]`                                                       | **Partial.** Auto-generated on/off, or upload VTT/SRT. Not editable in-app `[SP5]`                                                                                          |
| **YouTube**              | **Partial.** Channel-scoped. A show maps to a channel or playlist, with no network layer. RSS ingestion only in select regions `[YT1][YT2]` | **Partial.** Owner / Manager / Editor / Editor (limited) / Subtitle editor / Viewer, per channel. No approval workflow `[YT2]`                                                                       | **Yes (native)**, but a destination rather than an RSS host. RSS ingestion turns audio into static-image video. Apple HLS: N/A `[YT1]`                                 | **Partial.** Automatic captions that "may vary" in quality. Subtitle editor role `[YT3][YT2]`                                                                               |
| **Castos + WordPress**   | **Yes.** Unlimited podcasts on all plans. SSP gives each podcast its own feed `[CA1][CA3]`                                                  | **Partial.** Castos members can publish, edit, and view analytics; Admin-only settings. WordPress Podcast Manager / Podcast Editor. **WordPress is the editing authority** `[CA4][CA5][CA2]`         | **Partial.** Video file hosting on Pro ($99/mo). YouTube republishing on Growth. Apple HLS partner status undocumented `[CA1][X2]`                                     | **Yes.** Automatic transcription with quotas: 100/mo on Pro, unlimited on Premium `[CA1][CA6]`                                                                              |
| **Beamly**               | **Partial.** Starter and Creator allow 1 show; Business allows "10+ podcasts". Supports network websites with multiple shows `[BE1][BE2]`   | **Partial.** Team seats (1 / 3 / unlimited). Roles and approvals undocumented `[BE1]`                                                                                                                | **Partial.** Video hosting on Creator and above. Video feeds with "HLS streaming & MP4 fallback". Apple HLS partner status undocumented `[BE1][BE2][X2]`               | **Yes.** AI transcripts, VTT import from RSS, searchable transcripts with timestamps `[BE2]`                                                                                |
| **Ghost**                | **Partial.** Not a podcast host. Each show is a custom RSS route plus a template, and audio must be hosted elsewhere `[GH2]`                | **Yes (for drafts).** Contributors can draft but "are unable to … publish". Editors publish others' posts `[GH4]`                                                                                    | **N/A.** Ghost does not host podcast media `[GH2]`                                                                                                                     | Undocumented for podcasts `[GH2]`                                                                                                                                           |
| **Castopod**             | **Yes.** Multi-podcast instance (P0-02 hands-on) `[CO1][CO3]`                                                                               | **Partial.** Instance roles plus per-show contributor roles, enforced (403 across shows). **No approval gate** `[CO1][CO4]`                                                                          | **No.** `.mp4` upload rejected, no `alternateEnclosure` `[CO1]`                                                                                                        | **Partial.** Upload `.vtt`/`.srt`, emitted as `podcast:transcript`. No built-in generation `[CO1]`                                                                          |

### B. Audience and revenue

| Option                   | Comments / community                                                                                                               | Analytics (IAB certification)                                                                                                       | Private / premium feeds                                                                                                                                                         | DAI / programmatic                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Transistor**           | Undocumented `[TR11]`                                                                                                              | **Compliant (self-declared), not certified.** "We do not pay for the annual IAB certification." Not on the IAB list `[TR6][X1]`     | **Yes.** Private podcasts for 50 / 500 / 3,000 subscribers by plan, managed through the API `[TR1][TR8]`                                                                        | **Partial.** Self-sold campaign DAI (pre/mid/post), dynamic show notes, third-party tracking URLs, Professional+ only. Programmatic undocumented `[TR7][TR1]`                              |
| **Captivate**            | Undocumented `[CV6]`                                                                                                               | **Certified v2.2** (Download, Listener), last certified 2024-07-19 `[X1][CV7]`                                                      | **Yes.** "Private podcasting for everyone, on any plan, at no extra cost" `[CV6]`                                                                                               | **Yes.** AMIE dynamic content and campaigns. Programmatic "initially a beta release in the US", needs a Stripe account `[CV6][CV8]`                                                        |
| **Omny Studio**          | Undocumented `[OM1]`                                                                                                               | **Certified v2.2**: Omny Studio (Download, Listener) 2025-02-27; Triton Digital (Download, Ad Delivery, Listener) 2025-03-04 `[X1]` | **Yes.** Restricted content access with tokenised per-member feeds, revocable signing keys, and Apple Podcasts Subscriptions `[OM3][OM7]`                                       | **Yes.** DAI through TAP, "direct sold and programmatic" (TAP Programmatic) `[OM8]`                                                                                                        |
| **Acast**                | Undocumented `[AC2]`                                                                                                               | **Certified v2.2** (Download, Ad Delivery, Listener), last certified 2026-02-18 `[X1][AC6]`                                         | **Partial.** Acast+ Access issues private RSS per listener through the Access API. Mechanics of "premium subscriptions" on the pricing page are undocumented there `[AC7][AC1]` | **Yes.** Marketplace DAI across the back catalogue, plus sponsorships. Apply at 1,000+ monthly listeners, on any plan `[AC8]`                                                              |
| **Spotify for Creators** | **Yes.** Comments (replacing Q&A) and polls, with moderation settings `[SP6][SP7]`                                                 | Spotify-only listener stats. Spotify for Creators is not on the IAB list; sister product Megaphone is v2.2 (2025-11-12) `[X1]`      | **Yes.** Subscriptions with a private RSS per subscriber, or connect a third-party paid feed `[SP8][SP9]`                                                                       | **Partial.** Spotify Partner Program: must host on Spotify for Creators; 3 episodes, 2,000 consumption hours and 1,000 audience in 30 days; 50% ad share; eligible countries only `[SP10]` |
| **YouTube**              | **Yes.** Native comments with held-for-review queue, strictness levels, and 60-day retention of held comments `[YT6]`              | YouTube Analytics (views, not downloads). Not on the IAB podcast list `[X1]`                                                        | **Partial.** Channel memberships with members-only videos, subject to eligibility `[YT7]`                                                                                       | **Partial.** YouTube Partner Program: 1,000 subscribers plus 4,000 watch hours in 12 months (8,000 from 2027-02-01). Ads are YouTube-sold `[YT8]`                                          |
| **Castos + WordPress**   | **Partial.** Undocumented for Castos sites. SSP episodes can be WordPress posts (a WordPress capability, not a Castos one) `[CA3]` | **Compliant (self-declared), not certified.** "IAB v2-compliant". Not on the IAB list `[CA9][X1]`                                   | **Yes.** Per-subscriber revocable private feeds; MemberPress and Zapier integrations; 500 subscribers on Pro, add-on $50 per 500 `[CA7][CA1]`                                   | **Partial.** Castos Ads pre/post-roll with "no minimum audience". Whether ads are marketplace-sold or self-sold is undocumented `[CA8]`                                                    |
| **Beamly**               | **Yes.** Native comments on episodes, videos, and posts, members only, with moderation `[BE2]`                                     | Downloads, listeners, apps, locations for hosted shows. IAB undocumented; not on the IAB list `[BE2][X1]`                           | **Yes.** Memberships, paywall, private feeds, Stripe with 0% platform fee (Creator+) `[BE1][BE2]`                                                                               | Undocumented `[BE2]`                                                                                                                                                                       |
| **Ghost**                | **Yes.** Members-only comments (all or paid), hide/pin, member reporting with email notification `[GH5]`                           | N/A for podcast downloads (web and email analytics only) `[GH1]`                                                                    | **Partial.** Paid memberships (Publisher+). Private podcast feeds come through the official Transistor or Captivate integrations `[GH1][GH3]`                                   | Undocumented `[GH1]`                                                                                                                                                                       |
| **Castopod**             | **Yes.** ActivityPub-native comments; staff can delete; blocked-actor list. No queue or appeals `[CO1][CO5]`                       | Self-documents IAB **v2.0**. Not on the IAB list. P0-02 found counts inflatable via `X-Forwarded-For` `[CO1][X1]`                   | **Partial / at-risk.** Tokenised premium feeds, but the media redirect is public and unsigned (P0-02 W-PREMIUM) `[CO1]`                                                         | **No.** Not modelled `[CO1]`                                                                                                                                                               |

### C. Ownership, integration, and cost

| Option                   | API / webhooks / export                                                                                                                                                                                                                                                                                                                                                                                                                    | Custom domains                                                                            | Published price for a 2-show network                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transistor**           | **API:** `x-api-key`, 10 requests per 10 s; shows, episodes, analytics, private subscribers. **Webhooks:** `episode_created`, `episode_published`, `subscriber_created`, `subscriber_deleted`. **Export:** permanent free 301 (kept after cancellation). Bulk media export undocumented `[TR8][TR9]`                                                                                                                                       | **Partial.** Custom domain for the website. Feed and media domains undocumented `[TR10]`  | **Starter $19/mo or $228/yr**: unlimited shows, 20K downloads/mo, API. DAI needs Professional ($49/mo, $588/yr) `[TR1]`                                                                                         |
| **Captivate**            | **API:** exists, access by emailing `api@captivate.fm`; public reference and webhooks undocumented. **Export:** 301 on cancel, analytics export beforehand. Media export undocumented `[CV9][CV10]`                                                                                                                                                                                                                                        | **Partial.** Custom domain for the Captivate Site. Feed and media undocumented `[CV11]`   | **Personal $19/mo or $204/yr**: 30K downloads pooled, all features on every plan. Apple HLS video adds $12/mo per podcast `[CV1][CV3]`                                                                          |
| **Omny Studio**          | **API:** Management API v0/v1 with API key; CRUD on networks, programs, clips, playlists, plus analytics, audit events, and users; org-wide rate limits; read-only Consumer API with CORS. **Webhooks:** `{Entity}{ChangeType}` events signed with HMAC-SHA256 (`X-Omny-Signature`). **Export:** download-event export to your own cloud storage (paid add-on). Outbound RSS redirect only in third-party guides `[OM9][OM10][OM11][OM12]` | Undocumented `[OM5]`                                                                      | **Not published**; enterprise sales `[OM1]`                                                                                                                                                                     |
| **Acast**                | **API:** Publishing API (Pro / Creator Network), key issued by Customer Success, shows and episodes CRUD, no analytics, 60 req/min. **Webhooks:** single `episodePublished`. Access API for private feeds. **Export:** show redirection; "export any listen and revenue data … you will lose access once the redirect is in place" `[AC9][AC11][AC7][AC10]`                                                                                | **Yes (Pro).** Feed and website on your own subdomain, one CNAME per show `[AC12]`        | **Essential $25/mo or $14.99/mo billed annually**: multiple shows, transcripts. Team management and API need Pro ($40/mo or $29.99/mo annually). Apple video needs Video ($50/mo or $39.99/mo annually) `[AC1]` |
| **Spotify for Creators** | **API:** no public creator publishing API documented. The Distribution API is for hosting partners (Libsyn, Podigee, Audioboom, Audiomeans, Podspace). **Export:** no export button; the new host imports from RSS, then 301 (disable subscriptions first) `[SP11][SP12]`                                                                                                                                                                  | Undocumented `[SP1]`                                                                      | **Free**: "Host for free, distribute everywhere" `[SP1]`                                                                                                                                                        |
| **YouTube**              | **API:** Data API with a default 100 `videos.insert` calls/day in a separate bucket plus 10,000 units; uploads from unverified projects created after 2020-07-28 "restricted to private viewing mode". **Export:** Studio download (720p/360p, 5 per video per day) or Google Takeout `[YT4][YT5][YT9]`                                                                                                                                    | N/A. YouTube hosts no website or RSS feed; RSS is ingested, not served `[YT1]`            | **Free** (no hosting fee) `[YT1]`                                                                                                                                                                               |
| **Castos + WordPress**   | **API:** REST v2 with Bearer token; podcasts, episodes, private subscribers, categories; no analytics API; no webhooks in the published spec. **Export:** 301 redirect; per-episode audio download. WordPress holds the editorial record `[CA10][CA11][CA12][CA13]`                                                                                                                                                                        | **Yes.** Website with custom domain on all plans `[CA1]`                                  | **Essentials $19/mo or $190/yr**: unlimited podcasts, 1 team member. 5 members need Growth ($49/mo, $490/yr). Video hosting needs Pro ($99/mo, $990/yr) `[CA1]`                                                 |
| **Beamly**               | **API:** public API undocumented. Zapier outgoing triggers (episode published, membership created, comment created, …). **Export:** "Export available on request" `[BE2][BE1]`                                                                                                                                                                                                                                                             | **Yes.** All plans `[BE1]`                                                                | **Business $64/mo billed annually** (Starter and Creator are 1 show). Monthly-billed price not published `[BE1][BE2]`                                                                                           |
| **Ghost**                | **API:** Admin and Content APIs. **Webhooks:** 31 events (posts, pages, tags, members, site) via custom integrations. **Export:** JSON content and members CSV; media is not included in the JSON. MIT-licensed, so self-hosting is possible `[GH6][GH7][GH8]`                                                                                                                                                                             | **Yes.** Free custom domain on every plan `[GH1]`                                         | **Publisher $29/mo** (custom themes are needed for a podcast RSS template) **plus a separate audio host** `[GH1][GH2]`                                                                                          |
| **Castopod**             | **API:** REST API v1 is off by default, Basic auth, documented on the `next` branch. **Export:** no export feature; raw DB dump plus media copy (P0-02 W-EXPORT) `[CO6][CO1]`                                                                                                                                                                                                                                                              | **Partial.** Managed plans advertise custom domains. Self-hosted: your own domain `[CO2]` | **Self-hosted:** AGPL-3.0 licence at €0 plus infrastructure. **Managed:** Starter €9.96/mo (5 GB) or €119.52/yr; Podcaster €24/mo or €288/yr; Network €96/mo `[CO2][CO3]`                                       |

## Vendor narratives and integration surface

The integration surface lists what Relay would depend on if it **bought** that option instead of building:
APIs, webhooks, and export formats.

### Transistor

A strong, simple self-serve host. Unlimited shows and team members start at $19/mo, there is a clean REST API
with subscriber management, and the redirect-out policy is generous (the 301 is kept after cancellation).
Relay's gaps are editorial (no approval step), community (none documented), video (Apple HLS is still on a
waitlist), and certification (self-declared only).

- **APIs:** REST, `x-api-key`, 10 req/10 s. Shows, episodes (draft / scheduled / published), analytics
  (show, episodes, episode), private subscribers `[TR8]`.
- **Webhooks:** `episode_created`, `episode_published`, `subscriber_created`, `subscriber_deleted` `[TR8]`.
- **Export formats:** RSS (plus 301) `[TR9]`; transcripts as TXT/SRT/VTT/JSON/HTML `[TR4]`. No bulk media or
  records export is documented.

### Captivate

The broadest self-serve feature set: every feature on every plan, network roles, certified IAB v2.2, Apple HLS,
`podcast:transcript`, and a US-beta programmatic marketplace. The API is gated behind an email request with no
public reference, so Relay could not plan an integration from documentation alone.

- **APIs:** exists; access through `api@captivate.fm` `[CV10]`. Reference and webhooks are undocumented.
- **Webhooks:** undocumented.
- **Export formats:** RSS (plus 301); analytics reports downloaded before cancelling `[CV9]`. Media export is
  undocumented.

### Omny Studio (Triton Digital)

The enterprise benchmark and the most complete integration surface: a versioned management API, signed webhooks
for every entity change, an audit-events API, a raw download-event export to the customer's own storage, per-member
signed private feeds, `alternateEnclosure` with HLS, and direct plus programmatic ads through TAP. Pricing is not
published, and approvals, comments, and custom domains are undocumented.

- **APIs:** Management API v0/v1 (API key, org-wide rate limits); Consumer API (read-only, CORS) `[OM9]`.
- **Webhooks:** `{Entity}{ChangeType}` events (`ProgramCreated`, `ClipDeleted`, …), HMAC-SHA256 signature in
  `X-Omny-Signature` `[OM10]`.
- **Export formats:** RSS; WebVTT/SRT transcripts `[OM6]`; download-event records to customer cloud storage
  (add-on) `[OM11]`.

### Acast

Hosting bundled with the largest documented ad marketplace. That is the main reason to choose it: access to
demand. The surface is narrow. The API is publish-only (no analytics). There is a single `episodePublished` webhook.
Transcripts are not attached to episodes. Apple video is a limited beta. Acast explicitly warns that listen and
revenue data is lost once you redirect away.

- **APIs:** Publishing API (Pro), 60 req/min, shows and episodes CRUD including ad markers `[AC9]`; Access API
  for private feeds `[AC7]`.
- **Webhooks:** `episodePublished` only `[AC11]`.
- **Export formats:** RSS (plus redirect). Listen and revenue data must be exported before redirecting `[AC10]`.

### Spotify for Creators

A free host and an essential destination. Its community features (comments, polls) and video playback exist only
inside Spotify. Permissions cannot be scoped per show. Monetisation (SPP) requires hosting on Spotify. There is
no public creator API; video from external hosts goes through partner-only integrations. For Relay this is a
**destination**, matching the P2-09 assumption that video from external hosts is "manual".

- **APIs:** none documented for creators. The Distribution API is partner-only `[SP12]`.
- **Webhooks:** undocumented.
- **Export formats:** RSS, imported by the new host, plus 301 `[SP11]`.

### YouTube

A destination rather than a podcast host. RSS ingestion turns audio into static-image videos, starts them
private, and does not re-sync replaced audio `[YT1]`. The Data API is usable, but unaudited projects upload only
as private videos, and uploads have their own daily quota `[YT4][YT5]`. These facts match DECISIONS and feed P2-09.

- **APIs:** YouTube Data API v3 `[YT4]`.
- **Webhooks:** undocumented in the sources checked.
- **Export formats:** MP4 through Studio (720p/360p) or Google Takeout `[YT9]`.

### Castos + WordPress (Seriously Simple Podcasting)

A practical "hosting plus a real CMS" option. The integration guide states the constraint the pitch flagged:
episodes "must always be published and managed from SSP", and dashboard edits "will not push back" `[CA2]`.
WordPress is therefore the editorial authority, and Relay would inherit WordPress's content model and plugin
maintenance. The API is modest and has no webhooks or analytics.

- **APIs:** Castos REST v2 (Bearer): podcasts, episodes, private subscribers `[CA10][CA11]`. The WordPress REST
  API sits on the CMS side (not evaluated).
- **Webhooks:** none in the published spec `[CA11]`.
- **Export formats:** RSS (plus 301) `[CA12]`; per-episode audio download `[CA13]`. Editorial content lives in
  WordPress.

### Beamly

An audience-side platform. It hosts or syncs shows and adds network websites, memberships, paywalls, private
feeds, and members-only comments with moderation. Two shows need the $64/mo Business plan. There is no documented
public API, only Zapier triggers, and export is by request.

- **APIs:** undocumented.
- **Webhooks:** Zapier outgoing triggers only `[BE2]`.
- **Export formats:** by request to support `[BE2][BE1]`.

### Ghost

A strong open-source (MIT) membership and publishing CMS, with real comments and reporting, a contributor role
that cannot publish, 31 webhook events, and JSON export. It is **not** a podcast host: audio must live elsewhere,
and the podcast feed is a custom theme template that stores the audio URL in the Facebook Description field
`[GH2]`. It fits as the audience layer next to Transistor or Captivate, which both have official Ghost
integrations `[GH3]`.

- **APIs:** Admin and Content APIs `[GH6]`.
- **Webhooks:** 31 events (post, page, tag, member, site) `[GH6]`.
- **Export formats:** JSON (posts, pages, tags, settings), members CSV. Media is not included `[GH7]`.

### Castopod

See [P0-02](castopod.md) for the hands-on evidence. It has the best podcast-namespace and ActivityPub coverage
of any option and is open source. Architecturally it conflicts with four Relay rules (media delivery depends on
the app, masters are mutable, there is no approval or release manifest, and there is no export). A managed
offering now exists from €9.96/mo `[CO2]`.

- **APIs:** REST API v1 (off by default, Basic auth) `[CO6]`.
- **Webhooks:** undocumented. P0-02 found WebSub and ActivityPub broadcast but no webhooks `[CO1]`.
- **Export formats:** none. MariaDB dump plus media copy `[CO1]`.

## Cross-cutting findings for Relay

1. **Borrow from the market; don't claim novelty.** The P0-02 borrow list still applies. In addition, Omny's
   signed webhooks and audit events, its per-member revocable signing keys, and its customer-storage event
   export are the right shapes for Relay's P1-17 and P3-04 contracts.
2. **Relay's differentiators are the ones the pitch named (§4).** They are the release package with approvals,
   the connected archive, and verifiable ownership (export plus portable delivery). No vendor documents any of
   the three, so the demonstration value is real rather than a duplicate of the market.
3. **Never claim IAB certification** (conventions). Relay can document v2.2 _alignment_, as Transistor and Castos
   do with "compliant".
4. **Destination assumptions in P2-09 are confirmed.** Apple HLS is partner-only `[X3]`. Spotify video from
   external hosts is partner-only `[SP12]`. YouTube uploads from unaudited projects are private and quota-limited
   `[YT4][YT5]`.

## Sources

All sources checked **2026-09-26** unless noted. A source marked _(3rd-party)_ supports a cell only where the
vendor's own documentation is silent, and the cell says so.

### Shared

| ID  | Source                                                                                                                                                                            | Checked    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| X1  | [IAB Tech Lab: Compliant Companies (Podcast Compliance tab)](https://iabtechlab.com/compliance-programs/compliant-companies/)                                                     | 2026-09-26 |
| X2  | [Triton Digital: New partners announced for Apple Podcasts video (2026-03-16)](https://tritondigital.com/news-item/March-16-2026/new-partners-announced-for-apple-podcasts-video) | 2026-09-26 |
| X3  | [Apple: How to publish video (HLS) on Apple Podcasts](https://podcasters.apple.com/support/5593-how-to-publish-video)                                                             | 2026-09-26 |

### Transistor

| ID   | Source                                                                                                                                                  | Checked    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| TR1  | [Pricing](https://transistor.fm/pricing/)                                                                                                               | 2026-09-26 |
| TR2  | [Invite multiple collaborators (roles)](https://transistor.fm/features/invite-multiple-collaborators/)                                                  | 2026-09-26 |
| TR3  | [Video podcasting](https://transistor.fm/features/video/)                                                                                               | 2026-09-26 |
| TR4  | [AI transcription](https://transistor.fm/features/ai-transcription/)                                                                                    | 2026-09-26 |
| TR5  | [Which podcast apps support transcripts?](https://support.transistor.fm/en/article/which-podcast-apps-support-transcripts-qphklp/)                      | 2026-09-26 |
| TR6  | [Are Transistor's stats IAB compliant?](https://support.transistor.fm/en/article/are-transistors-stats-iab-compliant-12u141c/)                          | 2026-09-26 |
| TR7  | [Campaigns & DAI (help category)](https://support.transistor.fm/en/category/campaigns-dai-13nkmn3/)                                                     | 2026-09-26 |
| TR8  | [Transistor API reference](https://developers.transistor.fm/)                                                                                           | 2026-09-26 |
| TR9  | [How to forward your Transistor feed (301)](https://support.transistor.fm/en/article/how-to-forward-your-transistor-podcast-feed-301-redirect-1r1j8lj/) | 2026-09-26 |
| TR10 | [Using a custom domain for your podcast website](https://support.transistor.fm/en/article/using-a-custom-domain-for-your-podcast-website-ivsoyr/)       | 2026-09-26 |
| TR11 | [Transistor Help (index searched for comments)](https://support.transistor.fm/en/)                                                                      | 2026-09-26 |

### Captivate

`captivate.fm` marketing pages returned HTTP 403 to automated fetches and are blocked in the built-in browser, so
Captivate cells cite its help center.

| ID   | Source                                                                                                                                                                    | Checked    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| CV1  | [Plans & pricing FAQ](https://help.captivate.fm/en/article/plans-pricing-faq-10rg7d8/)                                                                                    | 2026-09-26 |
| CV2  | [Network and podcast team permissions tables](https://help.captivate.fm/en/article/network-and-podcast-team-permissions-tables-z765sa/)                                   | 2026-09-26 |
| CV3  | [Connect your show and request approval for Apple HLS video](https://help.captivate.fm/en/article/how-to-connect-apples-hls-video-podcast-feature-to-captivate-1durvlt/)  | 2026-09-26 |
| CV4  | [Podcast transcription FAQs](https://help.captivate.fm/en/article/podcast-transcription-faqs-1yi8x7q/)                                                                    | 2026-09-26 |
| CV5  | [Captivate Assistant FAQs](https://help.captivate.fm/en/article/captivate-assistant-faqs-ndurcx/)                                                                         | 2026-09-26 |
| CV6  | [Captivate Help: all categories (Private Podcasts, AMIE, Programmatic; no comments category)](https://help.captivate.fm/en/)                                              | 2026-09-26 |
| CV7  | [IAB certification & compliance explained](https://help.captivate.fm/en/article/iab-podcast-analytic-certification-compliance-explained-1k9qno9/)                         | 2026-09-26 |
| CV8  | [How to enable programmatic ads](https://help.captivate.fm/en/article/how-to-enable-programmatic-ads-ouh7ry/)                                                             | 2026-09-26 |
| CV9  | [How do I cancel a podcast? (301, analytics export)](https://help.captivate.fm/en/article/how-do-i-cancel-a-podcast-hsdn2h/)                                              | 2026-09-26 |
| CV10 | [Captivate API status page](https://api.captivate.fm/)                                                                                                                    | 2026-09-26 |
| CV11 | [Linking your custom website domain to your Captivate Site](https://help.captivate.fm/en/articles/4580083-linking-your-custom-website-domain-name-to-your-captivate-site) | 2026-09-26 |

### Omny Studio (Triton Digital)

Omny's help center moved to `help.tritondigital.com`; `help.omnystudio.com` links 301 there.

| ID   | Source                                                                                                                                                                             | Checked    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| OM1  | [Omny Studio product page](https://www.tritondigital.com/solutions/podcasting/omny-studio)                                                                                         | 2026-09-26 |
| OM2  | [Program-level user access and permissions](https://help.tritondigital.com/docs/program-level-user-access)                                                                         | 2026-09-26 |
| OM3  | [How do I keep an episode private (clip visibility)](https://help.tritondigital.com/docs/how-do-i-keep-an-episode-private-until-im-ready-to-share-it)                              | 2026-09-26 |
| OM4  | [Video podcasts](https://help.tritondigital.com/docs/video-podcasts)                                                                                                               | 2026-09-26 |
| OM5  | [RSS feeds (alternate enclosures)](https://help.tritondigital.com/docs/where-is-my-rss-feed)                                                                                       | 2026-09-26 |
| OM6  | [Activate transcription (pricing, `podcast:transcript`)](https://help.tritondigital.com/docs/activate-transcription)                                                               | 2026-09-26 |
| OM7  | [Secure podcast distribution](https://omnystudio.com/features/securedistribution)                                                                                                  | 2026-09-26 |
| OM8  | [Dynamic ad insertion for podcasts](https://help.tritondigital.com/docs/advertising-on-podcasts-in-omny-studio)                                                                    | 2026-09-26 |
| OM9  | [Management API](https://help.tritondigital.com/docs/management-api)                                                                                                               | 2026-09-26 |
| OM10 | [Setting up and receiving webhooks](https://help.tritondigital.com/docs/setting-up-and-receiving-webhooks)                                                                         | 2026-09-26 |
| OM11 | [Analytics data export (add-on)](https://help.tritondigital.com/docs/analytics-data-export)                                                                                        | 2026-09-26 |
| OM12 | _(3rd-party)_ [Transistor: How to forward your Omny Studio feed (301)](https://support.transistor.fm/en/article/how-to-forward-your-omny-studio-podcast-feed-301-redirect-kz9ih7/) | 2026-09-26 |

### Acast

| ID   | Source                                                                                                                                                                                   | Checked    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| AC1  | [Pricing](https://www.acast.com/pricing)                                                                                                                                                 | 2026-09-26 |
| AC2  | [Acast Learning Center index (no comments article)](https://learn.acast.com/llms.txt)                                                                                                    | 2026-09-26 |
| AC3  | [Introduction to user management](https://learn.acast.com/en/articles/4705730-introduction-to-user-management)                                                                           | 2026-09-26 |
| AC4  | [Video on Apple Podcasts via Acast](https://learn.acast.com/en/articles/15190085-video-on-apple-podcasts-via-acast)                                                                      | 2026-09-26 |
| AC5  | [Get started with transcripts](https://learn.acast.com/en/articles/12220293-get-started-with-transcripts)                                                                                | 2026-09-26 |
| AC6  | [How does Acast measure podcast download data? (IAB 2.2)](https://learn.acast.com/en/articles/4231372-how-does-acast-measure-podcast-download-data-iab-2-2)                              | 2026-09-26 |
| AC7  | [How do private Access listeners get access to their content?](https://learn.acast.com/en/articles/8717846-how-do-private-access-listeners-get-access-to-their-content)                  | 2026-09-26 |
| AC8  | [Monetizing with Acast Marketplace](https://learn.acast.com/en/articles/5503627-monetizing-with-acast-marketplace)                                                                       | 2026-09-26 |
| AC9  | [Acast Publishing API](https://learn.acast.com/en/articles/5790019-acast-publishing-api)                                                                                                 | 2026-09-26 |
| AC10 | [How to redirect your podcast, cancel, or delete your account](https://learn.acast.com/en/articles/5087325-how-to-redirect-your-podcast-cancel-your-subscription-or-delete-your-account) | 2026-09-26 |
| AC11 | [What is a WebHook?](https://learn.acast.com/en/articles/3505461-what-is-a-webhook)                                                                                                      | 2026-09-26 |
| AC12 | [Setting up your custom domain](https://learn.acast.com/en/articles/3505399-setting-up-your-custom-domain)                                                                               | 2026-09-26 |

### Spotify for Creators

| ID   | Source                                                                                                                                                                        | Checked    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| SP1  | [Spotify for Creators: podcast hosting](https://creators.spotify.com/features/podcast)                                                                                        | 2026-09-26 |
| SP2  | [Multiple shows under the same account](https://support.spotify.com/us/creators/article/multiple-shows-under-one-account/)                                                    | 2026-09-26 |
| SP3  | [Access levels in Spotify for Creators](https://support.spotify.com/us/creators/article/access-levels/)                                                                       | 2026-09-26 |
| SP4  | [Publishing videos](https://support.spotify.com/us/creators/article/publishing-videos/)                                                                                       | 2026-09-26 |
| SP5  | [Managing episode transcripts on Spotify](https://support.spotify.com/us/creators/article/managing-episode-transcripts-on-spotify/)                                           | 2026-09-26 |
| SP6  | [How comments are moderated](https://support.spotify.com/us/creators/article/comment-settings/)                                                                               | 2026-09-26 |
| SP7  | [Q&A is replaced by Comments](https://support.spotify.com/us/creators/article/how-to-use-q-a/)                                                                                | 2026-09-26 |
| SP8  | [Setting up Subscriptions](https://support.spotify.com/us/creators/article/setting-up-subscriptions/)                                                                         | 2026-09-26 |
| SP9  | [Paid podcasts: using your private RSS feed](https://support.spotify.com/us/creators/article/paid-podcasts-using-your-private-rss-feed/)                                      | 2026-09-26 |
| SP10 | [Spotify Partner Program](https://support.spotify.com/us/creators/article/spotify-partner-program/)                                                                           | 2026-09-26 |
| SP11 | [Switching away from Spotify for Creators with a 301 redirect](https://support.spotify.com/us/creators/article/switching-away-from-spotify-for-creators-with-a-301-redirect/) | 2026-09-26 |
| SP12 | [Expanding our video ecosystem with new partners (2026-05-14)](https://creators.spotify.com/resources/news/expanding-video-partners-and-platforms)                            | 2026-09-26 |

### YouTube

| ID  | Source                                                                                                                                                 | Checked    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| YT1 | [Deliver podcasts to YouTube with RSS](https://support.google.com/youtube/answer/13525207?hl=en)                                                       | 2026-09-26 |
| YT2 | [Channel permissions](https://support.google.com/youtube/answer/9481328?hl=en)                                                                         | 2026-09-26 |
| YT3 | [Use automatic captioning](https://support.google.com/youtube/answer/6373554?hl=en)                                                                    | 2026-09-26 |
| YT4 | [YouTube Data API: quota and compliance audits (page updated 2026-09-14)](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits) | 2026-09-26 |
| YT5 | [YouTube Data API: `videos.insert`](https://developers.google.com/youtube/v3/docs/videos/insert)                                                       | 2026-09-26 |
| YT6 | [Learn about comment settings](https://support.google.com/youtube/answer/9483359?hl=en)                                                                | 2026-09-26 |
| YT7 | [Get started with channel memberships](https://support.google.com/youtube/answer/7636690?hl=en)                                                        | 2026-09-26 |
| YT8 | [YouTube Partner Program overview & eligibility](https://support.google.com/youtube/answer/72851?hl=en)                                                | 2026-09-26 |
| YT9 | [Download YouTube videos that you've uploaded](https://support.google.com/youtube/answer/56100?hl=en)                                                  | 2026-09-26 |

### Castos + WordPress

| ID   | Source                                                                                                                                               | Checked    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| CA1  | [Pricing](https://castos.com/pricing/)                                                                                                               | 2026-09-26 |
| CA2  | [Quickstart: Seriously Simple Podcasting and Castos](https://support.castos.com/article/494-quickstart-guide-seriously-simple-podcasting-and-castos) | 2026-09-26 |
| CA3  | [Seriously Simple Podcasting (WordPress.org, v3.17.0, 2026-08-12)](https://wordpress.org/plugins/seriously-simple-podcasting/)                       | 2026-09-26 |
| CA4  | [Invite team members to your Castos account](https://support.castos.com/article/80-invite-team-members-to-your-castos-account)                       | 2026-09-26 |
| CA5  | [Add your team members in WordPress](https://support.castos.com/article/75-add-your-team-members-and-podcast-collaborators-in-wordpress)             | 2026-09-26 |
| CA6  | [Transcription](https://castos.com/transcription/)                                                                                                   | 2026-09-26 |
| CA7  | [Private podcasting](https://castos.com/private-podcasting-solutions/)                                                                               | 2026-09-26 |
| CA8  | [Castos Ads](https://castos.com/advertising/)                                                                                                        | 2026-09-26 |
| CA9  | [Podcast analytics](https://castos.com/podcast-analytics/)                                                                                           | 2026-09-26 |
| CA10 | [REST API technical documentation](https://support.castos.com/article/127-rest-api-technical-documentation)                                          | 2026-09-26 |
| CA11 | [Castos API reference (Swagger 2.0 spec)](https://app.castos.com/docs/api/index.html)                                                                | 2026-09-26 |
| CA12 | [Redirect your podcast's RSS feed](https://support.castos.com/article/76-redirect-your-podcasts-rss-feed)                                            | 2026-09-26 |
| CA13 | [Download a podcast episode from Castos](https://support.castos.com/article/182-download-a-podcast-episode-from-castos)                              | 2026-09-26 |

### Beamly

| ID  | Source                                                                                 | Checked    |
| --- | -------------------------------------------------------------------------------------- | ---------- |
| BE1 | [Pricing](https://beamly.com/pricing/)                                                 | 2026-09-26 |
| BE2 | [Beamly product knowledge map (`lastUpdated` 2026-06-24)](https://beamly.com/llms.txt) | 2026-09-26 |

### Ghost

| ID  | Source                                                                                  | Checked    |
| --- | --------------------------------------------------------------------------------------- | ---------- |
| GH1 | [Ghost(Pro) pricing](https://ghost.org/pricing/)                                        | 2026-09-26 |
| GH2 | [How to make a podcast RSS feed in Ghost](https://ghost.org/tutorials/custom-rss-feed/) | 2026-09-26 |
| GH3 | [Official Ghost + Transistor integration](https://ghost.org/integrations/transistor/)   | 2026-09-26 |
| GH4 | [Managing your team (staff roles)](https://ghost.org/help/managing-your-team/)          | 2026-09-26 |
| GH5 | [Commenting](https://ghost.org/help/commenting/)                                        | 2026-09-26 |
| GH6 | [Webhooks](https://docs.ghost.org/webhooks)                                             | 2026-09-26 |
| GH7 | [Exporting content and data](https://ghost.org/help/exports/)                           | 2026-09-26 |
| GH8 | [TryGhost/Ghost (MIT, v6.65.0 released 2026-09-22)](https://github.com/TryGhost/Ghost)  | 2026-09-26 |

### Castopod

| ID  | Source                                                                                          | Checked    |
| --- | ----------------------------------------------------------------------------------------------- | ---------- |
| CO1 | [P0-02 hands-on evaluation (Castopod 1.15.5)](castopod.md)                                      | 2026-09-26 |
| CO2 | [Managed Castopod plans](https://castopod.com/)                                                 | 2026-09-26 |
| CO3 | [castopod.org (AGPL-3.0, v1.15.5)](https://castopod.org/)                                       | 2026-09-26 |
| CO4 | [Docs: podcast contributors](https://docs.castopod.org/main/en/user-guide/podcast/contributors) | 2026-09-26 |
| CO5 | [Docs: fediverse](https://docs.castopod.org/main/en/user-guide/instance/fediverse)              | 2026-09-26 |
| CO6 | [Docs: REST API overview (`next`)](https://docs.castopod.org/next/en/api/)                      | 2026-09-26 |

## Open questions / unverified

- **Captivate API.** The API exists but has no public reference. Webhooks and export endpoints can't be assessed
  without requesting access, which P0-03 rules out.
- **Omny pricing, comments, and custom domains** are not in public docs. They would need a sales conversation,
  which P0-03 also rules out.
- **Apple's own HLS partner list** was not machine-readable. Partner status comes from Triton's announcement
  `[X2]` and vendor docs. Transistor and Acast describe their Apple video as waitlist or limited beta.
- **Ghost Publisher billing.** The pricing page shows $29/mo, but the snapshot did not separate monthly from yearly
  billing.
- **Castos Ads mechanism** (marketplace-sold or self-sold) is undocumented.
