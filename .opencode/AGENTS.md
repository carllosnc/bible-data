<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
<!-- caveman-end -->

<!-- use-bun-begin -->
This project uses Bun runtime. Always use bun/bunx commands, never node/npm/npx.

## Allowed Commands

| DO use         | DON'T use        |
|----------------|------------------|
| `bun install`  | `npm install`    |
| `bun add`      | `npm install pkg`|
| `bun remove`   | `npm uninstall`  |
| `bun run`      | `npm run`        |
| `bunx`         | `npx`            |
| `bun test`     | `npm test`       |
| `bun start`    | `node file.js`   |
| `bun run dev`  | `node --watch`   |
| `bunx --bun`   | `node -e`        |

## Scripts

- `bun start` — run main CLI
- `bun run dev` — watch mode
- `bun run download:protestant` — download all Protestant bibles
- `bun run download:catholic` — download all Catholic bibles
- `bun run download:all` — download everything

## Why

- Bun is 25x faster than Node/npm
- Built-in TypeScript support (no separate compile step)
- Built-in test runner, bundler, package manager
- This project already uses `bun.lock` and all scripts use `bun run`
<!-- use-bun-end -->
