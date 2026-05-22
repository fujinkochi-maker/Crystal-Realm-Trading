# AGENTS.md — Crystal Realms Trading Hub

## Stack

React 19 + TypeScript, TanStack Start (SSR), TanStack Router (file-based), TanStack React Query, Vite 7, Tailwind CSS v4, shadcn/ui (new-york, RSC:false), Bun, Cloudflare Workers.

## Commands

| Action                | Command               |
| --------------------- | --------------------- |
| Dev server            | `bun run dev`         |
| Build                 | `bun run build`       |
| Preview               | `bun run preview`     |
| Lint (+ format check) | `bun run lint`        |
| Format                | `bun run format`      |
| Deploy                | `npx wrangler deploy` |

`lint` runs ESLint with `eslint-plugin-prettier/recommended` — it checks formatting too. `format` auto-fixes with Prettier. No tests exist. No CI.

## Deploy

- Run `bun run build` **before** `npx wrangler deploy` — wrangler does not auto-build.
- Worker name is `crystalrealmtrading` (set in `wrangler.jsonc`).
- **Secrets** (`DISCORD_CLIENT_SECRET`, `JWT_SECRET`) are set via `npx wrangler secret put` and persist on the worker name — renaming the worker loses them, requiring re-set.
- Non-secret runtime vars (`DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `APP_URL`) live in `wrangler.jsonc:vars`.
- Build-time client vars (`VITE_DISCORD_WEBHOOK_URL`, `VITE_ADMIN_PASSWORD`) come from `.env`.
- Local server-only vars (`DISCORD_CLIENT_SECRET`, `JWT_SECRET`, etc.) go in `.dev.vars` (gitignored).
- KV namespace `PRICE_OVERRIDES` is configured with a real namespace ID.

## Critical config constraints

1. **Do NOT add duplicate Vite plugins.** `@lovable.dev/vite-tanstack-config` already bundles `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `cloudflare` (build-only), `componentTagger` (dev-only), `@` alias, env injection, and dedupe. Adding any manually breaks the app. See `vite.config.ts` header comment.

2. **Server entry redirection required.** `vite.config.ts` sets `tanstackStart.server.entry: "server"` so `@cloudflare/vite-plugin` picks up the SSR error wrapper at `src/server.ts`. Do not change this.

3. **SSR error handling is custom.** `src/server.ts` wraps TanStack Start's server entry with h3 error swallowing workaround (`consumeLastCapturedError` + `normalizeCatastrophicSsrResponse`). Do not replace the server entry point.

## Architecture

- **`src/server.ts`** is the Cloudflare Worker fetch handler (`wrangler.jsonc:main`). It intercepts Discord OAuth routes (`/api/auth/*`) before forwarding to TanStack Start SSR. Custom API routes added here:
  - `GET /api/auth/discord` — redirects to Discord OAuth
  - `GET /api/auth/discord/callback` — exchanges code, checks guild membership, sets JWT session cookie
  - `GET /api/auth/me` — returns current user from session cookie
  - `GET /api/auth/test` — diagnostic endpoint for env var config
- **OAuth/JWT utilities** live in `src/lib/discord-auth.ts` (HMAC-SHA256 via Web Crypto API, no external libs). JWT sessions expire after 7 days.
- **Env var loading** (`src/server.ts:getEnvVar`): reads `import.meta.env` first, falls back to Cloudflare Worker `env` parameter. `VITE_` vars are build-time inlined; non-`VITE_` vars are runtime from worker `vars`/secrets.
- **Routes** (`src/routes/`):
  - `index.tsx` — landing page, Top 3 expensive items
  - `items.tsx` — item catalog with search, type filter, price sort, `ReportPriceDialog`
  - `admin/prices.tsx` — admin price override management
- **Data** in `src/data/items.ts`: string prices with `k` suffix, range formats (`"800-1k "`), `/h`/`/s`/`ea` suffixes. Two parser functions `parsePriceFirst` (for sort low) and `parsePriceMax` (for top items) must check `hasK` on the **extracted part** only, not the whole string.
- **Entrypoints:** `src/start.ts` (TanStack Start instance) → `src/server.ts` (Worker fetch handler).
- **Path alias:** `@/` → `./src/*`.
- **CSS import:** Must use `?url` suffix (`import appCss from "../styles.css?url"`), as in `src/routes/__root.tsx:11`.
- **shadcn/ui** components in `src/components/ui/`. Config at `components.json`. Use `@/components`, `@/lib/utils` (`cn()` helper), `@/hooks` aliases.
- `.lovable/` is auto-generated template metadata — not user code.

## Price reporting flow

1. User clicks "[ Report Price ]" on an item card
2. `ReportPriceDialog` opens, fetches `/api/auth/me`
3. If unauthenticated → shows "Verify with Discord" button → redirects to `/api/auth/discord` → Discord OAuth → callback sets JWT cookie → redirects to `/items`
4. If authenticated → form auto-fills Discord handle (read-only, "Verified via Discord" caption)
5. Submit sends Discord embed directly from browser via `import.meta.env.VITE_DISCORD_WEBHOOK_URL`

## Env var split

| Prefix    | Where used              | Set in                                             |
| --------- | ----------------------- | -------------------------------------------------- |
| `VITE_*`  | Client bundle (browser) | `.env`, Vite inlines at build                      |
| No prefix | Server only (Worker)    | `wrangler.jsonc:vars` or `npx wrangler secret put` |

## Package manager quirks

- Bun lockfile (`bun.lock`). Do not use npm/pnpm/yarn.
- `bunfig.toml` enforces a 24h supply-chain guard (`minimumReleaseAge = 86400`). `@lovable.dev/vite-tanstack-config` is excluded. Adding new excludes requires user confirmation.

## Formatting & linting

- **Prettier:** `printWidth: 100`, `semi: true`, `singleQuote: false`, `trailingComma: "all"`. `routeTree.gen.ts` is gitignored from formatting.
- **ESLint:** `@typescript-eslint/no-unused-vars` is **off**; `react-refresh/only-export-components` is **warn**; `no-restricted-imports` blocks `"server-only"`.

## Build artifacts (gitignored)

`dist`, `.output`, `.vinxi`, `.tanstack/`, `.nitro`, `.wrangler/`, `.env`, `.dev.vars`
