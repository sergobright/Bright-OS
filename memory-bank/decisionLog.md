# Decision Log

## 2026-06-13 - Install Memory Bank

Decision: Use a Cline/Roo-style Memory Bank structure in `memory-bank/` with core files for project brief, product context, active context, system patterns, technical context, progress, and decisions.

Rationale: This gives future agents a predictable place for durable context while keeping unknown project details explicitly marked as unknown.

## 2026-06-13 - Adopt OpenSpec

Decision: Use OpenSpec in `openspec/` as the accepted requirements and planned-change workflow. Durable requirements live in `openspec/specs/`; planned requirement changes start in `openspec/changes/` before implementation.

Rationale: This makes stable project rules explicit and keeps future feature or architecture work tied to reviewable specs and change artifacts.

## 2026-06-13 - Use SocratiCode for Semantic Code Search

Decision: Use SocratiCode for semantic code search in Bright OS after confirming the codebase index is complete. Continue using `rg` for exact string matching, file discovery, and non-semantic repository inspection.

Rationale: SocratiCode provides indexed semantic code discovery, while `rg` remains the fastest fit for exact local searches.
