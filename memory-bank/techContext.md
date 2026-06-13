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
- Local Git is initialized on branch `main`.
- Remote `origin` is `git@github.com:sergobright/Bright-OS.git`.
- Git is configured with `core.sshCommand` to use `/home/mark/.ssh/bright_os_deploy_ed25519`.
- GitHub push is currently blocked until the generated public deploy key is added to GitHub with write access.
- OpenSpec requires Node.js `>=20.19.0`; the current shell has Node.js `v18.19.1`, which can emit engine warnings.

## Constraints

- Prefer SVG output from Kroki unless another format is requested.
- Use SocratiCode for semantic code search after confirming the codebase index is complete.
- Verify actual project files before relying on Memory Bank notes.
