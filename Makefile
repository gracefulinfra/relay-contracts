SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help deps dev test lint build image

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-8s %s\n", $$1, $$2}'

node_modules/.modules.yaml: package.json pnpm-lock.yaml
	pnpm install --frozen-lockfile

deps: node_modules/.modules.yaml ## Install dependencies from the lockfile

dev: ## Nothing to run locally
	@echo "SKIPPED: relay-contracts has no dev server."

test: deps ## Validate every JSON fixture against its schema (valid must pass, invalid must fail)
	pnpm test

lint: deps ## Spectral lint of OpenAPI (fails on warnings) and a Prettier check
	pnpm lint

build: ## Generate clients (pending)
	@echo "PENDING: client generation arrives with P0-04."

image: ## No image for this repo
	@echo "SKIPPED: relay-contracts does not produce an image."
