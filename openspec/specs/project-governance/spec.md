# Project Governance Specification

## Purpose

This specification defines the durable workflow and documentation rules for Bright OS so future project work has a stable source of truth.

## Requirements

### Requirement: OpenSpec is the accepted requirements source
Accepted durable requirements for Bright OS SHALL be recorded under `openspec/specs/`.

#### Scenario: Durable project rule is discovered
- **WHEN** a durable behavior, architecture constraint, workflow rule, local service, or project invariant is established
- **THEN** the requirement is recorded or updated in `openspec/specs/`

### Requirement: Planned changes use OpenSpec changes
Planned requirement changes MUST be represented under `openspec/changes/<change-id>/` before implementation begins.

#### Scenario: New feature or behavior is requested
- **WHEN** work changes accepted requirements or adds a new capability
- **THEN** a change directory is created with proposal, spec deltas, tasks, and design when needed before implementation

### Requirement: Completed changes are archived into specs
Completed OpenSpec changes SHALL be archived so accepted deltas are merged into `openspec/specs/` and historical change material moves under `openspec/changes/archive/`.

#### Scenario: Implementation and verification are complete
- **WHEN** all tasks for a change are complete and verification has passed or been documented
- **THEN** the change is archived and the main specs reflect the accepted behavior

### Requirement: Memory Bank remains durable context
The project SHALL maintain `memory-bank/` as durable context for goals, decisions, active work, technical notes, and verification status.

#### Scenario: Project context changes
- **WHEN** project goals, architecture, active work, decisions, or verification status changes
- **THEN** the relevant Memory Bank file is updated with small factual notes

### Requirement: Repository state is verified directly
Agents and maintainers MUST verify actual repository files before relying on Memory Bank or OpenSpec summaries.

#### Scenario: Documentation conflicts with files
- **WHEN** Memory Bank or OpenSpec content conflicts with the current repository state
- **THEN** the repository state is treated as authoritative and the stale documentation is corrected

### Requirement: SocratiCode is used for semantic code search
Agents and maintainers MUST use SocratiCode for semantic code search after confirming the project codebase index is complete.

#### Scenario: Semantic code search is needed
- **WHEN** an agent needs to find code by behavior, responsibility, feature, or natural-language meaning
- **THEN** the agent checks the SocratiCode index status and uses SocratiCode search once indexing is complete

#### Scenario: Exact repository inspection is needed
- **WHEN** an agent needs exact string matching, file discovery, or non-semantic repository inspection
- **THEN** the agent may use `rg` or equivalent local shell tools

### Requirement: Conversational questions are answered directly
If a user's message ends with a question, the assistant MUST answer directly instead of starting implementation or tool work unless the user explicitly asks to proceed.

#### Scenario: User asks a question
- **WHEN** the latest user message ends with a question mark
- **THEN** the assistant answers conversationally and does not begin file edits or commands without an explicit instruction to proceed
