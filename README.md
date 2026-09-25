# relay-contracts

Relay's contracts: the OpenAPI spec, event and release-manifest JSON Schemas, ADRs, and generated clients.

Part of **Relay**, a cloud-agnostic podcast network platform built as a portfolio project.
The build is driven by a prompt series; see the prompt index (`prompts/00-INDEX.md` in the planning
workspace) and the architecture decisions in
[relay-contracts/adr](https://github.com/gracefulinfra/relay-contracts/tree/main/adr).

## Status

Bootstrapped by **P0-01**. This repo contains only the CI and tooling skeleton; there is no product code yet.

## Quickstart

Prerequisites: see [relay-contracts/docs/version-matrix.md](https://github.com/gracefulinfra/relay-contracts/blob/main/docs/version-matrix.md).

```bash
git clone https://github.com/gracefulinfra/relay-contracts.git
cd relay-contracts
make test
make lint
```

| Target                   | What it does today                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make test`              | Validates every fixture in `fixtures/<schema>/{valid,invalid}/` against `schemas/<schema>.schema.json`. Valid fixtures must pass and invalid ones must fail |
| `make lint`              | Spectral lint of `openapi/*.yaml` (fails on warnings) and a Prettier check                                                                                  |
| `make build`             | Pending: client generation arrives with P0-04                                                                                                               |
| `make dev`, `make image` | Skipped: nothing to run, no image                                                                                                                           |

`openapi/openapi.yaml` and `schemas/bootstrap-smoke.schema.json` are bootstrap placeholders that exist so
CI checks real files. P0-04 replaces them.

## Layout

| Path                     | Contents                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| `adr/`                   | Architecture decision records (MADR). Start from `0000-template.md` |
| `openapi/`               | OpenAPI 3.1 documents                                               |
| `schemas/`               | JSON Schemas (draft 2020-12) for events and manifests               |
| `fixtures/`              | Valid and invalid examples for each schema                          |
| `docs/version-matrix.md` | Pinned tool and platform versions for all repos, with sources       |
| `docs/ci.md`             | CI conventions, image verification, and cross-repo access           |

## CI

`.github/workflows/ci.yml` runs the `check` job (Spectral, Prettier, and fixture validation) on every PR and push.
