# AGENTS.md — Crystal Realms Trading Hub

## Stack

React 19 + TypeScript, TanStack Start (SSR), TanStack Router (file-based), TanStack React Query, Vite 7, Tailwind CSS v4, shadcn/ui (new-york, RSC:false), Bun, Cloudflare Workers.

## Commands

| Action                | Command             |
| --------------------- | ------------------- |
| Dev server            | `bun run dev`       |
| Build                 | `bun run build`     |
| Build (dev mode)      | `bun run build:dev` |
| Preview               | `bun run preview`   |
| Lint (+ format check) | `bun run lint`      |
| Format                | `bun run format`    |

`lint` runs ESLint with `eslint-plugin-prettier/recommended` — it checks formatting too. `format` auto-fixes with Prettier.

No tests exist. No CI.

## Critical config constraints

1. **Do NOT add duplicate Vite plugins.** `@lovable.dev/vite-tanstack-config` already bundles `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `cloudflare` (build-only), `componentTagger` (dev-only), `@` alias, env injection, and dedupe. Adding any manually will break the app. See `vite.config.ts` header comment.

2. **Server entry redirection is required.** `vite.config.ts` sets `tanstackStart.server.entry: "server"` so `@cloudflare/vite-plugin` picks up the SSR error wrapper at `src/server.ts`. Wrangler config alone is insufficient.

3. **SSR error handling is custom.** `src/server.ts` wraps TanStack Start's server entry with h3 error swallowing workaround (`consumeLastCapturedError` + `normalizeCatastrophicSsrResponse`). Do not replace the server entry point.

## Architecture

- **Single route** at `src/routes/index.tsx` (landing page for a Discord trading community). Route tree is auto-generated at `src/routeTree.gen.ts` — do not edit. It has `/* eslint-disable */` header and is excluded in `.prettierignore`.
- **Entrypoints:** `src/start.ts` (TanStack Start instance) → `src/server.ts` (Cloudflare Worker fetch handler, defined as `main` in `wrangler.jsonc`).
- **Path alias:** `@/` → `./src/*` (configured in `tsconfig.json` and by `@lovable.dev/vite-tanstack-config`).
- **CSS import:** Must use `?url` suffix (`import appCss from "../styles.css?url"`), as done in `src/routes/__root.tsx:11`.
- **shadcn/ui** components live in `src/components/ui/`. Config at `components.json`. Use `@/components`, `@/lib/utils` (`cn()` helper), `@/hooks` aliases.
- `.lovable/` is auto-generated template metadata from the Lovable project generator — not user code.

## Package manager quirks

- Bun lockfile (`bun.lock`). Do not use npm/pnpm/yarn.
- `bunfig.toml` enforces a 24h supply-chain guard (`minimumReleaseAge = 86400`). `@lovable.dev/vite-tanstack-config` is excluded. To add new excludes, confirm with the user first.

## Formatting & linting

- **Prettier:** `printWidth: 100`, `semi: true`, `singleQuote: false`, `trailingComma: "all"`. `routeTree.gen.ts` is gitignored from formatting (in `.prettierignore`).
- **ESLint:** `@typescript-eslint/no-unused-vars` is **off**; `react-refresh/only-export-components` is **warn**; `no-restricted-imports` blocks `"server-only"` (Next.js pattern not applicable to TanStack Start).

## Build artifacts (gitignored)

`dist`, `.output`, `.vinxi`, `.tanstack/`, `.nitro`, `.wrangler/`
