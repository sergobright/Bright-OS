# Repository Baseline Specification

## Purpose

This specification captures the currently accepted baseline state of the Bright OS repository.

## Requirements

### Requirement: Repository is currently skeletal
The repository SHALL be treated as a skeletal project until application source code, runtime, and product goals are established.

#### Scenario: Future work needs product or stack assumptions
- **WHEN** a task depends on product behavior, runtime stack, or architecture that is not present in the repository
- **THEN** the missing assumption is documented instead of being treated as already decided

### Requirement: Top-level documentation structure is stable
The repository SHALL keep top-level project documentation in `README.md`, `AGENTS.md`, `memory-bank/`, and `openspec/`.

#### Scenario: Durable process documentation is added
- **WHEN** project process or requirement documentation is added
- **THEN** it is placed in the existing documentation structure unless a change establishes a new structure

### Requirement: OpenSpec CLI is pinned as project tooling
The project SHALL pin `@fission-ai/openspec` as development tooling and require Node.js `>=20.19.0` for supported OpenSpec CLI usage.

#### Scenario: OpenSpec commands are run
- **WHEN** a maintainer runs OpenSpec through project tooling
- **THEN** the command uses the pinned package version and a supported Node.js version
