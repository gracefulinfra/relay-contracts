---
status: accepted
date: 2026-09-25
decision-makers: "@lafronzt (project owner)"
prompt: P0-01
---

# Record architecture decisions

## Context and Problem Statement

Relay spans six repositories and is built slice by slice, often by agent sessions that start with no
memory of earlier work. The reasons behind architectural choices must survive between sessions and be
findable from any repo.

## Decision Drivers

- Implementers (human or agent) need one place to check before deviating from a convention.
- The planning decisions log (`02-DECISIONS.md`) says changes to its decisions need an ADR.
- A portfolio reviewer should be able to see why the system looks the way it does.

## Considered Options

- MADR-format ADRs in `relay-contracts/adr/`
- A wiki or external document
- Decisions recorded only in PR descriptions

## Decision Outcome

Chosen option: "MADR-format ADRs in `relay-contracts/adr/`", because they are versioned with the contracts
every other repo already pins, they are reviewed through PRs, and MADR is a widely used plain-Markdown format.

- Numbering is sequential and zero-padded: `NNNN-kebab-title.md`, starting from `adr/0000-template.md`.
- ADRs are immutable once accepted. To change a decision, add a new ADR and mark the old one
  `superseded by ADR-NNNN`.
- Changing a decision marked **U** in the decisions log (ADR-0002) requires the project owner's
  confirmation, recorded in the ADR.
- Every ADR names the prompt that raised it.

### Consequences

- Good, because decisions are discoverable from one repo and reviewed like code.
- Bad, because an ADR PR in `relay-contracts` must land before a deviating PR elsewhere, which adds a step.

### Confirmation

The PR template in every repo has a "Convention overrides" section that must cite an ADR.

## More Information

- MADR: <https://adr.github.io/madr/>
- Initial decisions: [ADR-0002](0002-initial-decisions.md)
