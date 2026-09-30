# Version matrix

The canonical list of pinned versions for all Relay repos. Update this file in the same PR as the pin.
**Verified** means the version was checked against the source on that date. It does not mean
continuous monitoring; Renovate proposes updates weekly.

## Toolchains and base images (pinned by P0-01)

| Component                                     | Pinned                     | Where                                  | Source                                                                                                                  | Verified   |
| --------------------------------------------- | -------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| Go                                            | 1.27.1                     | `go.mod` in Go repos, `relay-infra` CI | <https://go.dev/dl/?mode=json>                                                                                          | 2026-09-25 |
| Node.js                                       | 24.21.0 (LTS "Krypton")    | `.nvmrc` in TS repos                   | <https://nodejs.org/dist/index.json>                                                                                    | 2026-09-25 |
| pnpm                                          | 12.4.2                     | `packageManager` in `package.json`     | <https://www.npmjs.com/package/pnpm> (latest is 12.6.0; 12.4.2 is the locally installed version)                        | 2026-09-25 |
| TypeScript                                    | 6.0.3                      | TS repos                               | <https://www.npmjs.com/package/typescript>. 7.0.2 exists, but typescript-eslint 8.70.1 requires `<6.1.0` (ADR-0003 B10) | 2026-09-25 |
| typescript-eslint                             | 8.70.1                     | TS repos                               | <https://www.npmjs.com/package/typescript-eslint>                                                                       | 2026-09-25 |
| ESLint                                        | 10.11.0                    | TS repos                               | <https://www.npmjs.com/package/eslint>                                                                                  | 2026-09-25 |
| Prettier                                      | 3.9.9                      | TS repos, `relay-contracts`            | <https://www.npmjs.com/package/prettier>                                                                                | 2026-09-25 |
| Vitest                                        | 5.0.1                      | TS repos                               | <https://www.npmjs.com/package/vitest>                                                                                  | 2026-09-25 |
| golangci-lint                                 | 2.14.0                     | Go repos (`Makefile`, CI)              | <https://github.com/golangci/golangci-lint/releases>                                                                    | 2026-09-25 |
| govulncheck (`golang.org/x/vuln`)             | 1.8.0                      | `go.mod` tool directive                | `go list -m golang.org/x/vuln@latest`                                                                                   | 2026-09-25 |
| Spectral CLI                                  | 6.16.3                     | `relay-contracts`                      | <https://github.com/stoplightio/spectral/releases>                                                                      | 2026-09-25 |
| Ajv / ajv-formats                             | 8.20.0 / 3.0.1             | `relay-contracts`                      | <https://www.npmjs.com/package/ajv>                                                                                     | 2026-09-25 |
| Helm                                          | 4.3.0                      | `relay-infra` CI                       | <https://github.com/helm/helm/releases>                                                                                 | 2026-09-25 |
| kubeconform                                   | 0.8.0                      | `relay-infra`                          | <https://github.com/yannh/kubeconform/releases>                                                                         | 2026-09-25 |
| Kubernetes schema target                      | 1.36.4                     | `relay-infra` kubeconform              | Default k3s in k3d 5.9.0 (`v1.36.4-k3s1`)                                                                               | 2026-09-25 |
| yamllint                                      | 1.38.0                     | `relay-infra`                          | <https://github.com/adrienverge/yamllint/tags>                                                                          | 2026-09-25 |
| cosign                                        | 3.1.3                      | Image CI                               | <https://github.com/sigstore/cosign/releases>                                                                           | 2026-09-25 |
| syft                                          | 1.52.0                     | Image CI (via sbom-action)             | <https://github.com/anchore/syft/releases>                                                                              | 2026-09-25 |
| `golang:1.27.1-trixie`                        | `sha256:433790e5…dd305183` | Go Dockerfiles (build stage)           | `docker buildx imagetools inspect`                                                                                      | 2026-09-25 |
| `gcr.io/distroless/static-debian13:nonroot`   | `sha256:e2e927ec…c555e3`   | Go Dockerfiles (runtime)               | `docker buildx imagetools inspect`                                                                                      | 2026-09-25 |
| `node:24.21.0-trixie-slim`                    | `sha256:8ec5d755…20cffe`   | TS Dockerfiles (build stage)           | `docker buildx imagetools inspect`                                                                                      | 2026-09-25 |
| `gcr.io/distroless/nodejs24-debian13:nonroot` | `sha256:bb6b03d8…c8bf04d`  | TS Dockerfiles (runtime)               | `docker buildx imagetools inspect`                                                                                      | 2026-09-25 |

## GitHub Actions (pinned by full commit SHA)

| Action                        | Version | SHA                                        | Released   |
| ----------------------------- | ------- | ------------------------------------------ | ---------- |
| actions/checkout              | v7.0.1  | `3d3c42e5aac5ba805825da76410c181273ba90b1` | 2026-07-20 |
| actions/setup-go              | v7.0.0  | `b7ad1dad31e06c5925ef5d2fc7ad053ef454303e` | 2026-07-16 |
| actions/setup-node            | v7.0.0  | `820762786026740c76f36085b0efc47a31fe5020` | 2026-07-14 |
| pnpm/action-setup             | v6.1.0  | `ea17c68df8912ef543352723c149a84f56e3d413` | 2026-09-05 |
| golangci/golangci-lint-action | v9.3.0  | `ba0d7d2ec06a0ea1cb5fa41b2e4a3ab91d21278a` | 2026-06-29 |
| docker/setup-buildx-action    | v4.4.1  | `f87e5991a6d7451dcb8d9637bfbc97413f497069` | 2026-09-16 |
| docker/metadata-action        | v6.2.0  | `dc802804100637a589fabce1cb79ff13a1411302` | 2026-07-02 |
| docker/login-action           | v4.6.0  | `dbcb813823bdd20940b903addbd779551569679f` | 2026-07-29 |
| docker/build-push-action      | v7.4.0  | `c3c9e263c25d99ce0380d002d59b67737d91b0dc` | 2026-09-15 |
| sigstore/cosign-installer     | v4.1.2  | `6f9f17788090df1f26f669e9d70d6ae9567deba6` | 2026-05-07 |
| anchore/sbom-action           | v0.24.2 | `3ad7283483fc7af8ff2b4ea19663c2d5ca935e26` | 2026-08-28 |
| azure/setup-helm              | v5.0.1  | `9bc31f4ebc9c6b171d7bfbaa5d006ae7abdb4310` | 2026-06-23 |
| actions/upload-artifact       | v7.0.1  | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | 2026-04-10 |

SHAs were resolved with `gh api repos/<action>/commits/<tag>` from each project's latest GitHub release.

## Platform components (pinned by P0-05)

Verified on 2026-09-26 against each project's GitHub releases and its Helm repository index. The Helm chart
version is what `relay-infra` pins (in `platform/<service>/application.yaml`). The app version is the one
that chart ships.

| Component                          | Chart (repo)                                             | App version                                                                                       | Source                                                                                                                                                                          | Verified   |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| k3s (via k3d 5.9.0)                | —                                                        | v1.36.4-k3s1 (`sha256:edad48e1…b83657`)                                                           | <https://hub.docker.com/r/rancher/k3s/tags>                                                                                                                                     | 2026-09-26 |
| k3d                                | —                                                        | 5.9.0                                                                                             | <https://github.com/k3d-io/k3d/releases>                                                                                                                                        | 2026-09-26 |
| Argo CD                            | argo-cd 10.9.2 (argoproj.github.io/argo-helm)            | v3.5.3                                                                                            | <https://github.com/argoproj/argo-cd/releases>                                                                                                                                  | 2026-09-26 |
| Envoy Gateway (+ Gateway API CRDs) | gateway-helm 1.9.1 (oci://docker.io/envoyproxy)          | v1.9.1                                                                                            | <https://github.com/envoyproxy/gateway/releases>. **Overrides the 1.8.x baseline**: 1.9 is the current minor                                                                    | 2026-09-26 |
| cert-manager                       | cert-manager v1.21.2 (charts.jetstack.io)                | v1.21.2                                                                                           | <https://github.com/cert-manager/cert-manager/releases>                                                                                                                         | 2026-09-26 |
| External Secrets Operator          | external-secrets 2.11.0 (charts.external-secrets.io)     | v2.11.0                                                                                           | <https://github.com/external-secrets/external-secrets/releases> (ADR-0007)                                                                                                      | 2026-09-26 |
| CloudNativePG                      | cloudnative-pg 0.29.1 (cloudnative-pg.github.io/charts)  | 1.30.1                                                                                            | <https://github.com/cloudnative-pg/cloudnative-pg/releases>                                                                                                                     | 2026-09-26 |
| PostgreSQL (CNPG operand image)    | —                                                        | 17.11 (`ghcr.io/cloudnative-pg/postgresql:17.11-standard-trixie`, `sha256:09892aae…8fba3dc`)      | `docker buildx imagetools inspect` (latest 17.x; same digest as the `17-standard-trixie` tag)                                                                                   | 2026-09-27 |
| CNPG barman-cloud plugin           | plugin-barman-cloud 0.8.0                                | v0.15.0                                                                                           | <https://github.com/cloudnative-pg/plugin-barman-cloud/releases>                                                                                                                | 2026-09-26 |
| SeaweedFS                          | seaweedfs 4.47.0 (seaweedfs.github.io/seaweedfs/helm)    | 4.47                                                                                              | <https://github.com/seaweedfs/seaweedfs/releases>                                                                                                                               | 2026-09-26 |
| Keycloak                           | — (plain manifests)                                      | 26.7.4                                                                                            | <https://github.com/keycloak/keycloak/releases> (26.7.4 released 2026-09-16; this verifies the 26.7.x baseline)                                                                 | 2026-09-26 |
| Argo Workflows                     | argo-workflows 2.0.8 (argo-helm)                         | v4.1.4                                                                                            | <https://github.com/argoproj/argo-workflows/releases>                                                                                                                           | 2026-09-26 |
| Prometheus                         | prometheus 29.35.0 (prometheus-community)                | v3.15.0 (server only: no operator, CRDs, Alertmanager, or exporters)                              | <https://github.com/prometheus-community/helm-charts/releases>. Replaces the kube-prometheus-stack 91.7.0 pin: it did not fit the laptop profile (relay-infra docs/platform.md) | 2026-09-28 |
| Grafana                            | grafana 13.2.6 (grafana-community.github.io/helm-charts) | 13.2.2                                                                                            | <https://github.com/grafana-community/helm-charts/releases>. The Grafana charts moved from `grafana/helm-charts` (deprecated) to `grafana-community`                            | 2026-09-28 |
| Grafana Tempo                      | tempo 3.0.0 (grafana-community.github.io/helm-charts)    | 3.0.3 (monolithic, no Kafka)                                                                      | <https://github.com/grafana-community/helm-charts/releases>, <https://grafana.com/docs/tempo/latest/release-notes/v3-0/>                                                        | 2026-09-28 |
| OpenTelemetry Collector            | opentelemetry-collector 0.173.1 (open-telemetry)         | 0.160.0, contrib image `otel/opentelemetry-collector-contrib:0.160.0` (`sha256:799dc6cf…9572ad6`) | <https://github.com/open-telemetry/opentelemetry-helm-charts/releases>; contrib for the `awss3` exporter                                                                        | 2026-09-28 |
| yq / shellcheck                    | —                                                        | 4.53.6 / 0.11.0                                                                                   | GitHub releases                                                                                                                                                                 | 2026-09-26 |

## S3 conformance suite (pinned by P0-06)

`relay-infra/conformance/s3` and `make conformance-s3`. Verified on 2026-09-27.

| Component                                                                     | Pinned                                                                                | Where                                       | Source                                                                                                          | Verified   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- |
| AWS SDK for Go v2 (`aws-sdk-go-v2` / `config` / `credentials` / `service/s3`) | v1.47.1 / v1.33.6 / v1.20.6 / v1.113.4                                                | `relay-infra/go.mod`                        | `go list -m -json <module>@latest` (all released 2026-09-24)                                                    | 2026-09-27 |
| smithy-go                                                                     | v1.28.2                                                                               | `relay-infra/go.mod`                        | `go list -m -json github.com/aws/smithy-go@latest`                                                              | 2026-09-27 |
| SeaweedFS image (CI target)                                                   | `docker.io/chrislusf/seaweedfs:4.47` (`sha256:ce9e796f…6bfa6bf882`, multi-arch index) | `relay-infra/Makefile` `SEAWEEDFS_IMAGE`    | `docker buildx imagetools inspect`; must equal the chart's app version (checked by `scripts/s3-conformance.sh`) | 2026-09-27 |
| golangci-lint in `relay-infra`                                                | 2.14.0                                                                                | `relay-infra/Makefile`, CI (`install-only`) | Same as the Go repos row above                                                                                  | 2026-09-27 |
| govulncheck in `relay-infra`                                                  | 1.8.0                                                                                 | `relay-infra/go.mod` tool directive         | Same as the Go repos row above                                                                                  | 2026-09-27 |

## Contracts code generation (pinned by P0-04)

`relay-contracts` `make generate`, the committed Go module `gen/go`, and the TS package `clients/ts`.
Verified on 2026-09-28. Released OpenAPI 3.1 support was checked by compiling the real spec, not by
reading a README. The evidence is the `gen/go` tests (fixture round trips, nullability, the embedded
spec, and the strict server) and the `clients/ts` type tests (P0-04 implementation clarifications).

| Component                       | Pinned          | Where                                                               | Source                                                                                  | Verified   |
| ------------------------------- | --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| oapi-codegen                    | v2.8.0          | `Makefile` `OAPI_CODEGEN_VERSION` (`go run …@version`)              | `go list -m -json github.com/oapi-codegen/oapi-codegen/v2@latest` (released 2026-07-17) | 2026-09-28 |
| oapi-codegen runtime / nullable | v1.7.0 / v1.2.0 | `gen/go/go.mod`                                                     | `go list -m -json` (released 2026-08-16 / 2026-06-22)                                   | 2026-09-28 |
| kin-openapi (embedded spec)     | v0.149.0        | `gen/go/go.mod`                                                     | `go list -m -json` (released 2026-08-28)                                                | 2026-09-28 |
| openapi-typescript              | 7.13.0          | `clients/ts/package.json` (run with `--default-non-nullable=false`) | <https://www.npmjs.com/package/openapi-typescript> (released 2026-02-11; latest)        | 2026-09-28 |
| openapi-fetch                   | 0.17.0          | `clients/ts/package.json` (runtime dependency)                      | <https://www.npmjs.com/package/openapi-fetch> (released 2026-02-11; latest)             | 2026-09-28 |
| yaml (spec bundler)             | 2.9.1           | root `package.json`                                                 | <https://www.npmjs.com/package/yaml> (released 2026-09-11)                              | 2026-09-28 |
| actionlint (local check only)   | v1.7.12         | `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12`         | `go list -m -json github.com/rhysd/actionlint@latest` (released 2026-03-30)             | 2026-09-28 |

Redocly CLI 2.54.3 was evaluated as the bundler and rejected: its hoisted `$defs` names collide once
they become Go type names (`slug` and `Slug`). `scripts/bundle-openapi.mjs` prefixes them instead.

## Dev stack images (pinned by P0-05, ADR 0009)

relay-infra `compose/compose.yaml`, for the images the platform takes from Helm charts. SeaweedFS,
Keycloak, and the OTel Collector contrib image use the same digests as the rows above. Verified on
2026-09-28 with `docker buildx imagetools inspect`.

| Image                                     | Pinned                   | Same version as               |
| ----------------------------------------- | ------------------------ | ----------------------------- |
| `docker.io/library/postgres:17.11-trixie` | `sha256:d74eeac9…2ec46f` | CNPG operand PostgreSQL 17.11 |
| `docker.io/prom/prometheus:v3.15.0`       | `sha256:efd719c9…18753e` | prometheus chart 29.35.0      |
| `docker.io/grafana/tempo:3.0.3`           | `sha256:0296560a…68d5`   | tempo chart 3.0.0             |
| `docker.io/grafana/grafana:13.2.2`        | `sha256:ac461fb3…38a0`   | grafana chart 13.2.6          |

## relay-api libraries (pinned by P1-01)

Verified on 2026-09-30 with `go list -m <module>@latest` (the Go module proxy) and each project's GitHub
releases. The pins live in relay-api `go.mod` (and the Makefile, for sqlc).

| Component                                | Pinned                                                                  | Source                                                         | Verified   |
| ---------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| pgx (`github.com/jackc/pgx/v5`)          | v5.11.0                                                                 | <https://github.com/jackc/pgx/releases>                        | 2026-09-30 |
| goose (`github.com/pressly/goose/v3`)    | v3.28.0                                                                 | <https://github.com/pressly/goose/releases>                    | 2026-09-30 |
| sqlc                                     | 1.31.1, image `sqlc/sqlc:1.31.1` (`sha256:70f53171…e34e525537`)         | <https://github.com/sqlc-dev/sqlc/releases>                    | 2026-09-30 |
| River (`github.com/riverqueue/river`)    | v0.47.0 (schema `river`, migrations 002–006 dumped with its CLI)        | <https://github.com/riverqueue/river/releases>                 | 2026-09-30 |
| otelriver (`riverqueue/rivercontrib`)    | v0.12.0                                                                 | <https://github.com/riverqueue/rivercontrib/releases>          | 2026-09-30 |
| OpenTelemetry Go SDK                     | v1.46.0 (otelhttp v0.71.0; Prometheus bridge v0.68.0)                   | <https://github.com/open-telemetry/opentelemetry-go/releases>  | 2026-09-30 |
| otelpgx (`github.com/exaring/otelpgx`)   | v0.12.0                                                                 | <https://github.com/exaring/otelpgx/releases>                  | 2026-09-30 |
| Prometheus client (`client_golang`)      | v1.24.1                                                                 | <https://github.com/prometheus/client_golang/releases>         | 2026-09-30 |
| env (`github.com/caarlos0/env/v11`)      | v11.4.1                                                                 | <https://github.com/caarlos0/env/releases>                     | 2026-09-30 |
| oapi-codegen runtime                     | v1.7.0 (matches the `gen/go` module)                                    | <https://github.com/oapi-codegen/runtime/releases>             | 2026-09-30 |
| testcontainers-go (+ `modules/postgres`) | v0.44.0 (`moby/go-archive` raised to v0.3.0 for GO-2026-6253)           | <https://github.com/testcontainers/testcontainers-go/releases> | 2026-09-30 |
| PostgreSQL test image                    | `postgres:17.11-trixie` (`sha256:d74eeac9…8712ec46f`), as the dev stack | `docker buildx imagetools inspect`                             | 2026-09-30 |

## Platform components (not yet pinned)

These are the `01-CONVENTIONS.md` baselines. They are **unverified** until the prompt that deploys them
checks the official release documentation and adds a row above.

| Component                              | Baseline | Pinned by |
| -------------------------------------- | -------- | --------- |
| Astro                                  | 6        | P1-14     |
| React, Vite, TanStack Router and Query | —        | P1-12     |
| faster-whisper                         | —        | P1-07     |

## Portability rehearsal (pinned by P0-07)

`relay-infra/scripts/portability` and `make portability` ([ADR-0008](../adr/0008-portability-rehearsal.md)). Verified on 2026-09-27.

| Component                   | Pinned                                                                   | Where                                                        | Source                                                                              | Verified   |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| rclone (host tool)          | 1.75.1                                                                   | `relay-infra/scripts/lib.sh` `RCLONE_VERSION` (`go install`) | <https://github.com/rclone/rclone/releases> (latest, 2026-09-04)                    | 2026-09-27 |
| rclone image (in-cluster)   | `docker.io/rclone/rclone:1.75.1` (`sha256:45401ad7…1019c7a5`, OCI index) | `relay-infra/scripts/portability/common.sh` `RCLONE_IMAGE`   | `docker buildx imagetools inspect`; tag must equal `RCLONE_VERSION`                 | 2026-09-27 |
| age / age-keygen            | 1.3.2                                                                    | `relay-infra/scripts/lib.sh` `AGE_VERSION` (`go install`)    | <https://github.com/FiloSottile/age/releases> (latest, 2026-08-29)                  | 2026-09-27 |
| SeaweedFS (external target) | same image as the S3 conformance suite (`SEAWEEDFS_IMAGE`)               | `relay-infra/Makefile`, started by `scripts/external-s3.sh`  | Same row as the conformance suite; tag must equal the chart in `platform/seaweedfs` | 2026-09-27 |
