---
status: accepted
date: 2026-09-25
decision-makers: "@lafronzt (project owner)"
prompt: P0-01
---

# Container images on GHCR stay private

## Context and Problem Statement

GHCR creates new organization packages as private, and ADR-0003 made the source repos public. Should the
`ghcr.io/gracefulinfra/*` images be public too?

## Decision Outcome

**U**: the images stay **private** for now. The source repos remain public (ADR-0003 B2).

### Consequences

- Every image pull needs credentials: local k3d clusters, CI jobs in other repos, and any person or agent
  running `cosign verify`. See [docs/ci.md](../docs/ci.md#package-authentication).
- Signature and SBOM verification cannot be done anonymously, so each image job runs `cosign verify` and
  `cosign verify-attestation` itself, right after signing. That CI step is the standing verification evidence.
- The Sigstore transparency log (Rekor) is public, so each signature entry is public even though the
  image is private: it includes the image digest and the signing workflow identity.
- P0-05 must provide a GHCR pull secret, created by the local secrets script and never committed.

### Confirmation

The `Verify signature and SBOM attestation` step in each image job passes on `main`.

## More Information

Revisit before any public demo. Making a package public is a one-way change in GitHub's UI (a public
package cannot be made private again).
