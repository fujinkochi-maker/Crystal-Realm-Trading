import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  getOAuthUrl,
  exchangeCode,
  getUser,
  getUserGuilds,
  isInGuild,
  createSessionToken,
  verifySessionToken,
  getRedirectUri,
} from "./lib/discord-auth";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function getEnvVar(key: string, env: unknown): string {
  return (
    (import.meta as Record<string, Record<string, string>>).env?.[key] ??
    (env as Record<string, string>)?.[key] ??
    ""
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    (globalThis as Record<string, unknown>).__cloudflare_env = env;

    const url = new URL(request.url);

    if (url.pathname === "/api/auth/discord") {
      const clientId = getEnvVar("VITE_DISCORD_CLIENT_ID", env);
      const redirectUri = getRedirectUri(url.origin);
      return Response.redirect(getOAuthUrl(clientId, redirectUri), 302);
    }

    if (url.pathname === "/api/auth/discord/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing authorization code", { status: 400 });

      try {
        const clientId = getEnvVar("VITE_DISCORD_CLIENT_ID", env);
        const clientSecret = getEnvVar("VITE_DISCORD_CLIENT_SECRET", env);
        const guildId = getEnvVar("VITE_DISCORD_GUILD_ID", env);
        const jwtSecret = getEnvVar("VITE_JWT_SECRET", env);
        const redirectUri = getRedirectUri(url.origin);

        const token = await exchangeCode(code, clientId, clientSecret, redirectUri);
        const user = await getUser(token.access_token);
        const guilds = await getUserGuilds(token.access_token);

        if (!isInGuild(guilds, guildId)) {
          const errorPage = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Access Denied</title>
<style>
body{background:#0d0d2e;color:#e0e0e0;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.container{text-align:center;max-width:480px;padding:2rem}
h1{color:#8b5cf6;font-size:1.5rem;text-transform:uppercase;letter-spacing:0.3em}
p{color:#9ca3af;margin:1rem 0;line-height:1.6}
a{color:#00e5ff}
</style></head>
<body>
<div class="container">
<h1>◆ Access Denied ◆</h1>
<p>You must be a member of the Crystal Realms Discord server to use this feature.</p>
<p><a href="https://discord.gg/TJfR5EpzUw">Join the server</a> then try again.</p>
</div></body></html>`;
          return new Response(errorPage, {
            status: 403,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }

        const sessionToken = await createSessionToken(user, jwtSecret);

        const response = Response.redirect(`${url.origin}/items`, 302);
        response.headers.set(
          "Set-Cookie",
          `session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${86400 * 7}`,
        );
        return response;
      } catch (error) {
        console.error("Discord OAuth error:", error);
        return new Response("Authentication failed. Please try again.", { status: 500 });
      }
    }

    if (url.pathname === "/api/auth/me") {
      const cookie = request.headers.get("Cookie") || "";
      const match = cookie.match(/session=([^;]+)/);
      if (!match) {
        return new Response(JSON.stringify({ authed: false }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      const jwtSecret = getEnvVar("VITE_JWT_SECRET", env);
      const session = await verifySessionToken(match[1], jwtSecret);
      if (!session) {
        return new Response(JSON.stringify({ authed: false }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          authed: true,
          user: {
            id: session.sub,
            username: session.username,
            global_name: session.global_name,
            avatar: session.avatar,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
