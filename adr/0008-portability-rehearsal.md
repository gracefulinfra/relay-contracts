---
status: accepted
date: 2026-09-27
decision-makers: "@lafronzt (project owner)"
prompt: P0-07
---

# Portability is rehearsed as export → restore → verify to an identified recovery point

## Context and Problem Statement

The pitch requires portability to be demonstrated (§6, §10). P0-07 must move a release, a
representative database and a media set to a second Kubernetes environment, and record time, bytes,
manual steps and source changes. No provider is chosen yet (decision A5), and the laptop profile
(ADR-0007's 8 GB budget) fits one platform at a time. The 2026-09-25 review adds three requirements.
The Phase 0 result must be called a **local restore rehearsal**, distinct from independent provider
or storage validation. Database and object copies must share an identified recovery point. Keycloak
data and the required secrets and key material must be carried too.

## Decision Drivers

- The same scripts must later run unchanged between `provider-a` and `provider-b`: every provider
  detail comes from the env overlay and `envs/<env>/env.sh`.
- Database consistency cannot rely on bucket synchronization.
- Nothing secret in git (ADR-0007), and nothing secret in plaintext on the target's storage.
- It must fit on the reference laptop, and CI minutes must not grow on every PR.

## Considered Options

- Target S3: **a SeaweedFS container outside the target cluster** (TLS, its own CA and credentials),
  or SeaweedFS inside the target cluster
- Carried secrets: **an age-encrypted bundle**, SOPS + age files, or regenerating everything on the target
- CI: **manual dispatch only**, every PR, or local only
- Recovery point: **the end of an on-demand CNPG backup**, the latest WAL, or a timestamp

## Decision Outcome

Owner decisions (**U**, 2026-09-27):

- **Target S3 outside the cluster.** `envs/local-b` drops in-cluster SeaweedFS, as a provider overlay
  does for managed S3. Pods reach the endpoint by name (`s3.relay-b.internal:8443`, k3d hostAliases)
  over TLS with a private CA (`ObjectStore.endpointCA`, Argo Workflows `caSecret`). The source reaches
  it through `external-s3.sh attach`, the laptop's stand-in for an internet-reachable endpoint.
- **age-encrypted bundle** for what must travel with the data: the Keycloak admin and test-user
  credentials (including the TOTP secret) and both database owners' credentials. The bundle is stored
  next to the manifest on the target's storage; the age identity is kept apart
  (`$RELAY_HOME/portability/age.key`). Environment-bound secrets (S3 credentials, TLS CA, registry pull
  secret) are never carried.
- **CI: `workflow_dispatch` only** (`relay-infra/.github/workflows/portability.yml`).

Implementation defaults (**D**):

- **Recovery point = the end of an on-demand CNPG backup** of each cluster, restored with
  `bootstrap.recovery` and `recoveryTarget: {backupID, targetImmediate: true}`. The target passes it
  through `relay-root` as a run-time Kustomize patch, so a run needs no commit. A marker row written
  after the backup must be absent after the restore. The restored cluster archives to its own path,
  never into the archive it recovered from.
- **Objects are copied from an explicit SHA-256 inventory** taken after the backup. Because media and
  feeds are immutable (ADR-0006), that inventory is a superset of what the recovery point references.
  Every referenced object is re-hashed on the target.
- **Bulk copies run inside the source cluster** (an rclone Job), not through `kubectl port-forward`,
  which dropped the connection on 1 GiB in testing.
- **S3 clients use HTTP/1.1 against SeaweedFS over TLS.** The rehearsal's conformance run over HTTPS
  found that SeaweedFS 4.47 sends a `Content-Length` on HTTP/2 `304` responses, which Go's HTTP/2
  client (the AWS SDK default transport) rejects. P0-06 ran only plain HTTP. Relay's S3 clients (from
  P1-04) disable HTTP/2 for S3 endpoints, or TLS terminates in front of SeaweedFS.

### Consequences

- Good, because the rehearsal exercises what a provider move changes: a new cluster, DNS suffix, CA,
  storage class and S3 endpoint over TLS with new credentials. It restores Keycloak users with their
  second factor, and it proves where recovery stopped.
- Good, because a restore needs only the target's storage and the age identity; the source can be gone.
- Bad, because both endpoints are SeaweedFS on one machine. This is not storage interoperability or
  failure-domain evidence, and every report and gate must say so (`relay-infra/docs/portability.md#limitations`).
- Bad, because the carried-secrets list is fixed in `export.sh` until P1-18 makes it declarative.

### Confirmation

`make portability` (and the manual CI workflow) fails unless: the restored digest equals the
source's, the recovery markers match, every referenced object is present with its SHA-256, the
target passes `scripts/smoke.sh` (including Keycloak logins with the carried credentials), and the S3
conformance suite passes over HTTP/1.1. `make test` fails if `env.sh` and the overlay disagree.

## More Information

- Evidence: `relay-infra/docs/portability/runs/`, and `relay-infra/conformance/s3/reports/local-b-*`.
- Revisit when the owner picks providers. Provider portability is demonstrated only by a
  `provider-a` → `provider-b` run (P3-08 at the latest), with conformance against a different S3
  implementation.
- Related: ADR-0006 (immutable, versioned media), ADR-0007 (secret management).
