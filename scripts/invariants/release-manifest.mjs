// Cross-field rules for a release manifest that JSON Schema cannot express.
// relay-api must enforce the same rules before it writes a manifest (P1-09).
export default function releaseManifestInvariants(m) {
  const errors = [];
  const byId = new Map();
  for (const a of m.assets) {
    if (byId.has(a.assetId)) errors.push(`asset ${a.assetId} is listed twice`);
    byId.set(a.assetId, a);
  }

  const enc = byId.get(m.enclosure.assetId);
  if (!enc) {
    errors.push("enclosure asset is not listed in assets");
  } else {
    if (enc.role !== "rendition") errors.push("enclosure asset must have role rendition");
    if (enc.url !== m.enclosure.url) errors.push("enclosure url differs from its asset url");
    if (enc.bytes !== m.enclosure.length) errors.push("enclosure length differs from asset bytes");
    if (enc.mime !== m.enclosure.mime) errors.push("enclosure mime differs from asset mime");
    if (enc.edition !== m.access.edition)
      errors.push("enclosure edition differs from access edition");
  }

  for (const a of m.assets) {
    if (!a.url.includes(`/a/${a.assetId}/`))
      errors.push(`asset ${a.assetId} url is not versioned by its id`);
  }

  if (m.transcript) {
    for (const id of m.transcript.assetIds) {
      const a = byId.get(id);
      if (!a) errors.push(`transcript asset ${id} is not listed in assets`);
      else if (!["transcript", "caption"].includes(a.role))
        errors.push(`transcript asset ${id} must have role transcript or caption`);
    }
  }
  if (m.chapters) {
    const a = byId.get(m.chapters.assetId);
    if (!a) errors.push("chapters asset is not listed in assets");
    else if (a.role !== "chapters") errors.push("chapters asset must have role chapters");
  }
  const image = m.metadata.episode.imageAssetId;
  if (image && !byId.has(image)) errors.push("episode image asset is not listed in assets");
  for (const marker of m.adMarkers ?? []) {
    if (!byId.has(marker.assetId))
      errors.push(`ad marker ${marker.markerId} asset is not listed in assets`);
  }

  // Every pinned input must have a matching approval.
  const approved = new Set(m.approvals.map((a) => `${a.subjectType}:${a.subjectId}`));
  if (!approved.has(`episode_revision:${m.revision.id}`))
    errors.push("no approval for the pinned episode revision");
  if (m.transcript && !m.approvals.some((a) => a.approvalId === m.transcript.approvalId))
    errors.push("transcript approvalId is not in approvals");
  if (m.chapters && !m.approvals.some((a) => a.approvalId === m.chapters.approvalId))
    errors.push("chapters approvalId is not in approvals");

  const original = Date.parse(m.originalPublishedAt);
  const effective = Date.parse(m.effectiveAt);
  if (m.sequence === 1 && original !== effective)
    errors.push("first release must have effectiveAt equal to originalPublishedAt");
  if (effective < original) errors.push("effectiveAt is before originalPublishedAt");
  for (const a of m.approvals) {
    if (Date.parse(a.approvedAt) > Date.parse(m.createdAt))
      errors.push(`approval ${a.approvalId} is after the manifest was created`);
  }

  return errors;
}
