---
name: use-bun
description: Ensures all commands use bun/bunx instead of node/npm/npx. This project exclusively uses the Bun runtime.
---

# Use Bun

This project uses [Bun](https://bun.sh) as its JavaScript runtime, package manager, and test runner.

## Rules

- Always use `bun` instead of `node`
- Always use `bun install` / `bun add` / `bun remove` instead of `npm install` / `npm i`
- Always use `bunx` instead of `npx`
- Always use `bun run <script>` instead of `npm run <script>`
- Always use `bun test` instead of `npm test` or `jest`

## Common Commands

| Action                  | Command                    |
|-------------------------|----------------------------|
| Install all deps        | `bun install`              |
| Add a package           | `bun add <pkg>`            |
| Remove a package        | `bun remove <pkg>`         |
| Run start script        | `bun start`                |
| Run dev (watch)         | `bun run dev`              |
| Run a script            | `bun run <script>`         |
| Execute a package       | `bunx <pkg>`               |
| Run tests               | `bun test`                 |
| TypeScript check        | `bunx tsc --noEmit`        |

## Project Scripts

- `bun start` — interactive CLI to download bibles
- `bun run dev` — same but with file watching
- `bun run download:protestant` — bulk download all Protestant versions
- `bun run download:catholic` — bulk download all Catholic versions
- `bun run download:all` — download everything

## Verification

If you see `node`, `npm`, `npx`, or `npm run` in any command, replace with the `bun` equivalent.
