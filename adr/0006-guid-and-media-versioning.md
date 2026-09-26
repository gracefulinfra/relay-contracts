---
status: accepted
date: 2026-09-26
decision-makers: "@lafronzt (project owner)"
prompt: P0-04
---

# Episode GUIDs, versioned media, and enclosure URL rules

## Context and Problem Statement

Podcast apps identify an episode by its `<guid>` and download its `<enclosure>` URL. If the GUID changes,
subscribers see a duplicate episode. If the bytes at a URL change, caches, resumed downloads, and the
`length` in the feed stop agreeing with each other. Apple's feed requirements call for permanent GUIDs, a
correct enclosure `length` and `type`, and support for HEAD and byte-range requests
([Apple podcast requirements](https://podcasters.apple.com/support/823-podcast-requirements)).

Relay has to preserve these identities through corrections, imports, and migrations. Conventions rules 4 and
5 require it: "Episode GUIDs are permanent" and "Masters are immutable". The 2026-09-25 review found that
"stable URLs could serve changed bytes while carrying immutable caching headers". It chose permanent,
versioned enclosure URLs as a Relay default. This ADR records that default. Note that Apple does not
mandate version-specific URLs; it is Relay's choice.

## Decision Drivers

- A correction must never make an app show the episode twice, or move it in the feed's order.
- Corrected media must reach new downloads, and in-flight downloads of the old file must not break.
- Media delivery must keep working when the API is down (architecture rule 2), so the URL-to-bytes mapping
  has to live in object storage and the edge, not in an API lookup.
- Imports must keep their original GUIDs exactly, even when they aren't UUIDs.
- Rights takedowns must be able to remove media at once.

## Considered Options

- **A. Versioned, immutable URLs.** Each delivery version gets its own permanent URL. A correction explicitly
  selects a new URL.
- **B. One stable URL per episode that always serves the latest version.** Short cache lifetimes and
  purges on correction.
- **C. Stable URL with a query-string version** (`…/episode.mp3?v=3`).

## Decision Outcome

Chosen option: **A. Versioned, immutable URLs**. It is the only option in which a URL's bytes never
change, so long-lived edge caching is safe, and the feed `length` is always correct for the URL next to it.

### Rules: episode GUID

| #   | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | A native episode's GUID is a **UUIDv4, generated when the episode is created** (not at publish), and stored as a lowercase canonical string. It is emitted as `<guid isPermaLink="false">`.                                                                                                                                                                                                                                                                                                   |
| G2  | The GUID is **never derived from mutable fields** (title, slug, URL, date), is **never regenerated**, and is **read-only** in the API. There is no endpoint to change it.                                                                                                                                                                                                                                                                                                                     |
| G3  | GUID uniqueness is **scoped to the show**: `UNIQUE (show_id, guid)`. It is never reused, even after an episode is unpublished or deleted. A deleted episode keeps a tombstone row holding its GUID.                                                                                                                                                                                                                                                                                           |
| G4  | **Imported GUIDs are opaque strings**, preserved byte for byte. They are not trimmed, lowercased, or parsed, and they may be URLs, tags, or legacy IDs. The only validation is that they are 1–2048 characters with no leading or trailing whitespace. `guidOrigin: imported`.                                                                                                                                                                                                                |
| G5  | **Missing GUIDs on import** block the item until an operator reconciles it. The recommended choice is to adopt the item's original enclosure URL as its GUID, because that is what most podcast apps fell back to when the source feed had no `<guid>`. The alternative is to generate a UUIDv4, and accept that existing subscribers may see a duplicate. The choice is recorded as `guidOrigin: reconciled` with an audit event.                                                            |
| G6  | **Duplicate GUIDs within one imported show** block the import of every item that shares the GUID until an operator resolves each one (keep one and skip the rest, or assign a reconciled GUID to all but one). The import never picks one silently.                                                                                                                                                                                                                                           |
| G7  | Once an episode has a release manifest, its GUID is frozen. Reconciliation (G5, G6) is only possible before the first release.                                                                                                                                                                                                                                                                                                                                                                |
| G8  | The show-level **`podcast:guid`** is separate from episode GUIDs. For a native show, it is a UUIDv5 of the show's first canonical feed URL (without the scheme and trailing slashes) in the namespace `ead4c236-bf58-58c6-a2c6-a6b28d128cb6`, as the [podcast namespace](https://podcasting2.org/docs/podcast-namespace/tags/guid) specifies. It is computed **once**, at show creation, and is not recomputed when the feed URL changes. An imported show keeps its existing `podcast:guid`. |

### Rules: media versions and URLs

| #   | Rule                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | **Masters are immutable.** An uploaded master is written once to the private bucket under a key that is never reused. A replacement master is a **new `MediaAsset` version** in the same lineage, never an overwrite.                                                                                                                                                                                             |
| V2  | **Every delivery file is an immutable `MediaAsset` row** with its own UUID, lineage, version number, SHA-256, byte count, and MIME type. Re-encoding the same master produces a new version, even if the output bytes happen to be identical.                                                                                                                                                                     |
| V3  | **Public URL shape:** `https://{media-host}/a/{assetId}/{fileName}`. `assetId` is the version's UUID. `fileName` is chosen when the version is created and never changes. Changing the file name is itself a new version. An analytics or measurement prefix may be put in front of the path (the IAB v2.3 URL-prefix pattern), but the canonical path stays the same.                                            |
| V4  | **Bytes at a URL never change.** The edge serves released versions with `Cache-Control: public, max-age=31536000, immutable`, an `ETag` derived from the SHA-256, and HEAD and byte-range support. Origins never accept writes to an existing released key.                                                                                                                                                       |
| V5  | **A new release manifest is required for any change to what a feed item points at.** Selecting a different enclosure version is an explicit field in the correction revision (`enclosureAssetId`). There is no "latest" pointer. The manifest pins the new URL **and its exact `length`**.                                                                                                                        |
| V6  | **Corrections keep the GUID and the original `pubDate`.** `originalPublishedAt` is set by the first release and copied into every later manifest. A correction changes the item's content and, if selected, its enclosure URL. It never changes its identity or its position in the feed.                                                                                                                         |
| V7  | **A correction that doesn't select new media keeps the old URL.** A metadata-only correction (for example, fixing the notes) produces a manifest with the same enclosure asset, URL, and length.                                                                                                                                                                                                                  |
| V8  | **Retention.** When a release stops referencing a version, the version becomes `retired`. It keeps being served at its URL, with the same bytes, for the **retention period: 90 days by default**, configurable per network, and never less than 30. After that, its bytes are purged, and the URL returns `301` to the current release's matching asset (same role and edition), or `410 Gone` if there is none. |
| V9  | **Takedown.** For `rights` or `legal` reasons, an admin can purge a version at once. The URL returns `410 Gone` (never a redirect), edge caches are purged, and the action is audited with a reason. The row, its SHA-256, and its size stay, for export and audit.                                                                                                                                               |
| V10 | **Masters and non-released files are never public.** Masters, incoming uploads, previews, drafts, and unapproved transcripts stay in private buckets. Only versions pinned by a release manifest get a public path (conventions: cross-cutting requirements).                                                                                                                                                     |
| V11 | **Derived assets record their source version.** Renditions, captions, transcripts, and chapter sets name the exact master version they came from. A new master version does not silently re-use captions or chapters timed against the old one; readiness blocks until they are regenerated or re-approved (see the state machines).                                                                              |

### Consequences

- Good, because a URL's bytes never change, so edge caches, resumed downloads, and feed `length` values stay
  consistent. Caching can be long-lived, which also keeps media online during an API outage.
- Good, because a release manifest plus the retained versions reproduces exactly what any listener was
  served, which the full export (P1-20) and sponsor fulfilment evidence (P3-01) need.
- Good, because imported GUIDs and dates are preserved without interpretation, so migrations don't create
  duplicates.
- Bad, because a corrected episode is downloaded again by apps that re-fetch on an enclosure change. This is
  the correct outcome for corrected audio, but it counts as a new download. Analytics (P1-17) must attribute
  downloads to the asset version, and must not treat a correction re-download as new audience.
- Bad, because retained versions cost storage for the retention period. P0-08's cost model must include it.
- Neutral, because destinations that ingest media once (for example, YouTube via RSS) are not updated by a
  new enclosure URL. The distribution state machine reports them as `out_of_sync` or `manual_required`.

### Confirmation

- The release-manifest schema requires a versioned enclosure URL, and the fixture invariants check that
  every asset URL contains its own asset ID, and that the enclosure `length` equals the asset's byte count
  (`make test`).
- P1-04: tests that a replacement upload creates a new version and never overwrites a key.
- P1-10: a feed test that a correction preserves `<guid>` and `<pubDate>`, and updates `<enclosure url length>`.
- P1-11: an edge test that a released URL serves identical bytes and `ETag` before and after a correction,
  a purged URL returns `301` or `410` per V8 and V9, and a direct origin write to a released key is rejected.
- P1-16: import tests for opaque, missing, and duplicate GUIDs (G4–G6).

## Pros and Cons of the Options

### A. Versioned, immutable URLs

- Good, because bytes never change at a URL, so caching and `length` are always correct.
- Good, because the URL can be generated and served from object storage alone.
- Bad, because old versions must be retained and then redirected or removed, under a policy.

### B. One stable URL per episode

- Good, because the feed's enclosure URL never changes.
- Bad, because the same URL serves different bytes over time. Caches and resumed range requests can splice
  two versions, and the feed `length` is wrong until every cache expires.
- Bad, because it forces short cache lifetimes, which weakens delivery during an API or origin outage.

### C. Stable URL with a query-string version

- Good, because it is easy to generate.
- Bad, because many CDNs and podcast apps ignore or strip query strings when caching or identifying files,
  so it degrades to option B in practice.
- Bad, because measurement prefixes and redirect services handle query strings inconsistently.

## More Information

- [Domain model](../model/erd.md), [state machines](../model/state-machines.md),
  [release manifest schema](../schemas/release-manifest.schema.json).
- Decisions log: conventions rules 4 and 5, and the 2026-09-25 review clarifications ("versioned enclosure
  URLs"; "release manifests separate from delivery receipts").
- [Podcast namespace `podcast:guid`](https://podcasting2.org/docs/podcast-namespace/tags/guid).
- Revisit if a major destination starts to require stable enclosure URLs across corrections, or if the
  retention cost in P0-08's model is material.
