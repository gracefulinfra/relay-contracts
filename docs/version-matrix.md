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

SHAs were resolved with `gh api repos/<action>/commits/<tag>` from each project's latest GitHub release.

## Platform components (not yet pinned)

These are the `01-CONVENTIONS.md` baselines. They are **unverified** until the prompt that deploys them
checks the official release documentation and adds a row above.

| Component                              | Baseline                               | Pinned by    |
| -------------------------------------- | -------------------------------------- | ------------ |
| PostgreSQL / CloudNativePG             | 17 / 1.30.x                            | P0-05        |
| Argo CD, Argo Workflows                | — / 4.1.x                              | P0-05, P1-05 |
| Envoy Gateway, cert-manager            | 1.8.x / —                              | P0-05        |
| SeaweedFS                              | —                                      | P0-05        |
| Keycloak                               | 26.7.x (unverified; see decisions log) | P1-02        |
| River, sqlc, goose, pgx                | — / 1.31.x / — / v5                    | P1-01        |
| Astro                                  | 6                                      | P1-14        |
| React, Vite, TanStack Router and Query | —                                      | P1-12        |
| faster-whisper                         | —                                      | P1-07        |
