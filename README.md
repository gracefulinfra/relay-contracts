# relay-contracts

Relay's contracts: the OpenAPI spec, event and release-manifest JSON Schemas, ADRs, and generated clients.

Part of **Relay**, a cloud-agnostic podcast network platform built as a portfolio project.
The build is driven by a prompt series; see the prompt index (`prompts/00-INDEX.md` in the planning
workspace) and the architecture decisions in
[relay-contracts/adr](https://github.com/gracefulinfra/relay-contracts/tree/main/adr).

## Status

Bootstrapped by **P0-01**. **P0-04** adds the domain model, the state machines, the release-manifest,
delivery-receipt, and full-export schemas, **OpenAPI v0** (`openapi/relay.v0.yaml`), and the generated
**TS client** (`@gracefulinfra/relay-client`) and **Go strict-server stub** (`gen/go`).

## Quickstart

Prerequisites: see [relay-contracts/docs/version-matrix.md](https://github.com/gracefulinfra/relay-contracts/blob/main/docs/version-matrix.md).

```bash
git clone https://github.com/gracefulinfra/relay-contracts.git
cd relay-contracts
make test
make lint
```

| Target                   | What it does                                                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make test`              | Validates every fixture against its schema and invariants, proves each `relay-*` Spectral rule can fail, checks the cost model, and runs the Go stub tests (`-race`) and the TS client tests (Vitest, including type tests) |
| `make lint`              | Spectral on `openapi/*.yaml` (fails on warnings), Prettier, `go vet` and `gofmt` on `gen/go`, and `tsc` and ESLint on `clients/ts`                                                                                          |
| `make generate`          | Bundles `openapi/relay.v0.yaml` into `gen/openapi/relay.v0.json`, then regenerates `gen/go/relayapi/relay.gen.go` (oapi-codegen) and `clients/ts/src/generated/relay.v0.ts` (openapi-typescript). Commit the result         |
| `make check-generated`   | Fails if the committed generated code differs from a fresh `make generate`. CI runs it                                                                                                                                      |
| `make build`             | Builds `clients/ts/dist` and compiles the Go stub                                                                                                                                                                           |
| `make dev`, `make image` | Skipped: nothing to run, no image                                                                                                                                                                                           |

Change the API by editing `openapi/relay.v0.yaml` (conventions: the OpenAPI is updated first), then
`make generate`, and commit the spec and the generated code together.

## Using the generated code

- **TypeScript** (relay-admin, relay-site): `@gracefulinfra/relay-client` on GitHub Packages. Add
  `@gracefulinfra:registry=https://npm.pkg.github.com` to `.npmrc`, and authenticate as described in
  [docs/ci.md](docs/ci.md#package-authentication). `createRelayClient({ baseUrl, getAccessToken })` returns a
  fully typed [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) client. It never sends the staff token to `/public/*`.
- **Go** (relay-api): `go get github.com/gracefulinfra/relay-contracts/gen/go@vX.Y.Z` (public; no token). Implement
  `relayapi.StrictServerInterface` and mount it with `relayapi.HandlerWithOptions(relayapi.NewStrictHandler(impl, mw), relayapi.StdHTTPServerOptions{BaseURL: "/v0"})`.
  `relayapi.GetSwagger()` returns the embedded spec, including each operation's `x-relay-authz`.

## Releases

Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`. It checks that the tag,
`clients/ts/package.json`, and the spec's `info.version` agree, reruns every check, publishes the client to
GitHub Packages, tags the Go module `gen/go/vX.Y.Z` on the same commit, and creates a GitHub release with
the bundled spec and both packages. Bump all three versions in one PR before tagging.

## Layout

| Path                     | Contents                                                                   |
| ------------------------ | -------------------------------------------------------------------------- |
| `adr/`                   | Architecture decision records (MADR). Start from `0000-template.md`        |
| `model/`                 | Domain model (`erd.md`) and state machines (`state-machines.md`)           |
| `openapi/`               | OpenAPI 3.1 source (`relay.v0.yaml`)                                       |
| `gen/`                   | Generated: the bundled spec (`gen/openapi`) and the Go module (`gen/go`)   |
| `clients/ts/`            | `@gracefulinfra/relay-client` (generated types plus a thin wrapper)        |
| `schemas/`               | JSON Schemas (draft 2020-12) for events and manifests                      |
| `fixtures/`              | Valid and invalid examples for each schema, and why each invalid one fails |
| `scripts/invariants/`    | Cross-field rules JSON Schema cannot express, one module per schema        |
| `docs/version-matrix.md` | Pinned tool and platform versions for all repos, with sources              |
| `docs/ci.md`             | CI conventions, image verification, and cross-repo access                  |
| `evaluations/`           | Castopod (P0-02) and vendor (P0-03) evaluations                            |
| `reports/`               | Gate reports (`phase-0.md`) and the cost model (`cost-model.md`, P0-08)    |

## CI

`.github/workflows/ci.yml` runs the `check` job on every PR and push: `make lint`, `make test`,
`make check-generated`, and `make build`. It uploads the bundled spec, the client tarball, and the Go stub as
the `relay-contracts-<sha>` artifact. `.github/workflows/release.yml` runs on `vX.Y.Z` tags.
