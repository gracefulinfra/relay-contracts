# relay-contracts

Relay's contracts: the OpenAPI spec, event and release-manifest JSON Schemas, ADRs, and generated clients.

Part of **Relay**, a cloud-agnostic podcast network platform built as a portfolio project.
The build is driven by a prompt series; see the prompt index (`prompts/00-INDEX.md` in the planning
workspace) and the architecture decisions in
[relay-contracts/adr](https://github.com/gracefulinfra/relay-contracts/tree/main/adr).

## Status

Bootstrapped by **P0-01**. **P0-04** adds the domain model, the state machines, and the release-manifest and
delivery-receipt schemas. The OpenAPI v0 document and generated clients follow in a second P0-04 PR.

## Quickstart

Prerequisites: see [relay-contracts/docs/version-matrix.md](https://github.com/gracefulinfra/relay-contracts/blob/main/docs/version-matrix.md).

```bash
git clone https://github.com/gracefulinfra/relay-contracts.git
cd relay-contracts
make test
make lint
```

| Target                   | What it does today                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make test`              | Validates every fixture in `fixtures/<schema>/{valid,invalid}/` against `schemas/<schema>.schema.json` and its cross-field invariants. Valid fixtures must pass, and each invalid one must fail with the error named in `expected-failures.json`. Also checks the cost model: the pitch's 5.76 TB example reproduces, and `reports/cost-model/outputs.*` are current |
| `make lint`              | Spectral lint of `openapi/*.yaml` (fails on warnings) and a Prettier check                                                                                                                                                                                                                                                                                           |
| `make build`             | Pending: client generation arrives with P0-04                                                                                                                                                                                                                                                                                                                        |
| `make dev`, `make image` | Skipped: nothing to run, no image                                                                                                                                                                                                                                                                                                                                    |

`openapi/openapi.yaml` is still the bootstrap placeholder. The second P0-04 PR replaces it with `openapi/relay.v0.yaml`.

## Layout

| Path                     | Contents                                                                   |
| ------------------------ | -------------------------------------------------------------------------- |
| `adr/`                   | Architecture decision records (MADR). Start from `0000-template.md`        |
| `model/`                 | Domain model (`erd.md`) and state machines (`state-machines.md`)           |
| `openapi/`               | OpenAPI 3.1 documents                                                      |
| `schemas/`               | JSON Schemas (draft 2020-12) for events and manifests                      |
| `fixtures/`              | Valid and invalid examples for each schema, and why each invalid one fails |
| `scripts/invariants/`    | Cross-field rules JSON Schema cannot express, one module per schema        |
| `docs/version-matrix.md` | Pinned tool and platform versions for all repos, with sources              |
| `docs/ci.md`             | CI conventions, image verification, and cross-repo access                  |
| `evaluations/`           | Castopod (P0-02) and vendor (P0-03) evaluations                            |
| `reports/`               | Gate reports (`phase-0.md`) and the cost model (`cost-model.md`, P0-08)    |

## CI

`.github/workflows/ci.yml` runs the `check` job (Spectral, Prettier, fixture validation, and the cost-model check) on every PR and push.
