// Cross-field rules for a delivery receipt that JSON Schema cannot express.
export default function deliveryReceiptInvariants(r) {
  const errors = [];
  const scope = r.output.kind === "destination" ? r.output.publicationTargetId : r.output.kind;
  if (r.idempotencyKey !== `${scope}:${r.manifestId}`)
    errors.push(`idempotencyKey must be "${scope}:${r.manifestId}"`);

  // A delivered output is only delivered if every verification check passed.
  if (r.result === "delivered") {
    for (const part of ["feedSnapshot", "edge"]) {
      const failed = Object.entries(r[part]?.checks ?? {}).filter(([, ok]) => !ok);
      for (const [check] of failed)
        errors.push(`delivered receipt has failing check ${part}.${check}`);
    }
  }
  if (r.external?.confirmedBy && r.result !== "confirmed")
    errors.push("external.confirmedBy is only allowed on a confirmed receipt");
  return errors;
}
