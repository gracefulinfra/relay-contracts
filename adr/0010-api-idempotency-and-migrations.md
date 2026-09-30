---
status: accepted
date: 2026-09-30
decision-makers: "@lafronzt (project owner)"
prompt: P1-01
---

# relay-api: idempotency storage, forward-only expand/contract migrations, and Argo CD sync ordering

## Context and Problem Statement

OpenAPI v0 requires an `Idempotency-Key` on every mutating operation, with a 24-hour replay window.
P1-01's implementation clarifications add more: keys are scoped to the actor, method, and resource,
and bind a request-body hash. Authorization is rechecked before a replay, reuse with different input is
rejected, concurrent requests are serialized, and effects and results persist atomically. The TTL must
never remove a business uniqueness constraint.

P1-01 also needs a migration strategy. Argo CD renders the relay-api chart rather than running a Helm
release, several replicas run during a rolling upgrade, and conventions say migrations only move
forward. How are idempotency results stored, and how do schema changes reach a running cluster safely?

## Decision Drivers

- The P1-01 clarifications above, and conventions rule 8 (idempotency everywhere external).
- Conventions: cross-module commands must commit state, audit records, and River jobs atomically
  (A7: enqueue in the same transaction).
- A failed upgrade must not take the running release down.
- Keep it small: PostgreSQL is already there. Add no new infrastructure (laptop footprint).

## Considered Options

- **Idempotency**: (1) store results in PostgreSQL in the request's own transaction; (2) store results
  in a separate transaction before and after the handler (a "recovery point" design); (3) a cache
  such as Redis.
- **Migrations**: (a) an Argo CD Sync-hook Job ordered by sync waves; (b) a PreSync hook; (c) an init
  container in each Deployment; (d) migrate on process start.

## Decision Outcome

**Idempotency: option 1.** `platform.idempotency_keys` has the primary key
`(actor, method, path, key)` and stores the body's SHA-256. The middleware runs after routing and
authorization, so authorization is rechecked before every replay. It opens the request transaction,
claims the key with `INSERT … ON CONFLICT DO NOTHING`, runs the handler in that transaction (module
code writes through `db.Querier`), stores status, allow-listed headers, and body, and commits once.

- A concurrent duplicate blocks on the primary key, then replays. After a lock timeout it gets
  `409 idempotency-key-in-progress`.
- Different input with the same key gets `409 idempotency-key-reused`.
- 5xx responses and panics roll back: no stored response and no side effect, so the client can retry.
- Expired rows are ignored lazily and deleted by a River job. Uniqueness that matters to the business
  (GUIDs, slugs) is enforced by constraints on the business tables, never by this table.

Option 2 lets long handlers release the lock early but needs recovery logic for half-done requests.
Option 3 adds a service and cannot commit atomically with the effect.

**Migrations: option a, forward-only and expand/contract.** Migrations are goose SQL embedded in the
image. `relay-migrate up` runs as an Argo CD `Sync` hook Job at sync-wave −1, after its configuration
(wave −2) and before the Deployments (wave 0), on first install and on every upgrade. A goose advisory lock
serializes runs, and each migration is one transaction.

- A failed Job fails the sync, and the Deployments keep the previous release on the last good schema.
- Every migration must be compatible with the previous release, because old pods keep serving while
  new ones roll out. So a release only adds. Removals and renames come a release later.
- `/readyz` is ready when the database has every migration the binary knows. A database that is
  _ahead_ also counts as ready, so old replicas stay ready mid-upgrade.
- There are no down migrations. A bad migration is fixed by the next one.

A PreSync hook (b) would run before the ExternalSecret that holds its database credentials exists on
first install. An init container (c) runs once per pod and races between replicas. Migrating on start
(d) couples every replica to the schema change and hides failures in crash loops.

### Consequences

- Good, because every clarification is enforced by one database mechanism, and each has its own test
  in relay-api (`internal/platform/idempotency`).
- Good, because a module's state change, its audit record, its River job, and the stored response
  commit together, which is what conventions ask of cross-module commands.
- Bad, because the request transaction, and the key's row lock, last as long as the handler. Slow or
  external work must go to River jobs, not stay inside requests (relay-api `docs/follow-ups.md`).
- Bad, because the problem types `idempotency-key-required` and `idempotency-key-in-progress`, and the
  `Idempotent-Replayed` header, are implemented before the spec names them. They join OpenAPI v0 in the
  next contracts change.
- Neutral: expand/contract takes discipline in review. Nothing enforces it mechanically yet.

### Confirmation

relay-api tests:

- idempotency: `TestReplayReturnsSameResponseWithoutDuplicateEffect`, `…ScopedToActorMethodAndResource`,
  `…AuthorizationIsRecheckedBeforeReplay`, `…ConcurrentRequestsWithOneKeyRunOnce`,
  `…ServerErrorsAreNotStoredAndRollBack`, and `…ExpiredKeyStartsFresh`;
- migrations: `TestFailedUpgradeLeavesDatabaseAtLastGoodVersion` and `TestDatabaseAheadOfBinaryIsCurrent`.

relay-infra: the k3d first-install and failed-upgrade rehearsal in the P1-01 PR.
