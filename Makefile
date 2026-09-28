SHELL := /bin/bash
.DEFAULT_GOAL := help

# Pinned code generator versions (docs/version-matrix.md). The TS generator is pinned in
# clients/ts/package.json.
OAPI_CODEGEN_VERSION := v2.8.0
OAPI_CODEGEN := go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@$(OAPI_CODEGEN_VERSION)
CLIENT := pnpm --filter @gracefulinfra/relay-client
GENERATED := gen clients/ts/src/generated

.PHONY: help deps dev generate check-generated test lint build image

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-16s %s\n", $$1, $$2}'

node_modules/.modules.yaml: package.json pnpm-lock.yaml clients/ts/package.json
	pnpm install --frozen-lockfile

deps: node_modules/.modules.yaml ## Install dependencies from the lockfile

dev: ## Nothing to run locally
	@echo "SKIPPED: relay-contracts has no dev server."

generate: deps ## Bundle OpenAPI v0, then regenerate the Go stub (gen/go) and the TS client types
	pnpm bundle
	cd gen/go && $(OAPI_CODEGEN) -config oapi-codegen.yaml ../openapi/relay.v0.json && go mod tidy
	$(CLIENT) generate

check-generated: generate ## Fail if committed generated code differs from a fresh generation
	@if ! git diff --quiet -- $(GENERATED) || [[ -n "$$(git ls-files --others --exclude-standard -- $(GENERATED))" ]]; then \
	  git diff --stat -- $(GENERATED); git ls-files --others --exclude-standard -- $(GENERATED); \
	  echo "FAIL: generated code is stale. Run 'make generate' and commit the result."; exit 1; \
	fi
	@echo "ok: generated code is up to date"

test: deps ## Fixtures, Spectral rule tests, cost model, Go stub tests, and TS client tests
	pnpm test
	cd gen/go && go test -race ./...
	$(CLIENT) test

lint: deps ## Spectral (fails on warnings), Prettier, go vet on the stub, and the client's tsc and ESLint
	pnpm lint
	cd gen/go && go vet ./... && test -z "$$(gofmt -l .)"
	$(CLIENT) typecheck
	$(CLIENT) lint

build: deps ## Build the TS client (clients/ts/dist) and compile the Go stub
	cd gen/go && go build ./...
	$(CLIENT) build

image: ## No image for this repo
	@echo "SKIPPED: relay-contracts does not produce an image."
