# Tech Context

## Stack

Unknown.

## Tooling

Known local service:

- Kroki at `http://127.0.0.1:8000`
- SocratiCode for semantic code search and codebase indexing.

Project development tooling:

- OpenSpec CLI pinned as `@fission-ai/openspec` `1.4.1` in `package.json`.

## Commands

- `npm run openspec -- <args>` - run the pinned OpenSpec CLI.
- `npm run openspec:validate` - validate all OpenSpec specs and changes in strict mode.

## Environment

- Workspace: `/srv/projects/bright-os`
- Current repository state does not expose a valid Git repository despite a `.git/` directory being present.
- OpenSpec requires Node.js `>=20.19.0`; the current shell has Node.js `v18.19.1`, which can emit engine warnings.

## Constraints

- Prefer SVG output from Kroki unless another format is requested.
- Use SocratiCode for semantic code search after confirming the codebase index is complete.
- Verify actual project files before relying on Memory Bank notes.
