// Cross-field rules for an export index that JSON Schema cannot express.
const REQUIRED_TYPES = ["network", "show", "episode", "episode_revision", "media_asset"];

export default function exportIndexInvariants(doc) {
  const errors = [];
  const seen = new Set();
  for (const r of doc.records) {
    if (seen.has(r.recordType)) errors.push(`record type ${r.recordType} is listed twice`);
    seen.add(r.recordType);
    if (r.path !== `records/${r.recordType}.ndjson`)
      errors.push(`${r.recordType} path must be records/${r.recordType}.ndjson`);
  }
  for (const type of REQUIRED_TYPES)
    if (!seen.has(type)) errors.push(`required record type ${type} is missing`);
  if (!doc.media.included && (doc.media.objectCount !== 0 || doc.media.bytes !== 0))
    errors.push("media not included, so objectCount and bytes must be 0");
  if (doc.recoveryPoint.capturedAt > doc.createdAt)
    errors.push("recoveryPoint.capturedAt is after createdAt");
  return errors;
}
