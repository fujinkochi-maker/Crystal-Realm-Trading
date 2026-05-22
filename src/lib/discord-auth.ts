const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_API_URL = "https://discord.com/api/v10";

export function getOAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `https://discord.com/oauth2/authorize?${params}&scope=identify%20guilds`;
}

export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const res = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function getUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to get user");
  return res.json() as Promise<{
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  }>;
}

export async function getUserGuilds(accessToken: string): Promise<{ id: string }[]> {
  const res = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to get guilds");
  return res.json() as Promise<{ id: string }[]>;
}

export function isInGuild(guilds: { id: string }[], guildId: string): boolean {
  return guilds.some((g) => g.id === guildId);
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

async function hmacSHA256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

export type SessionPayload = {
  sub: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  iat: number;
  exp: number;
};

export async function createSessionToken(
  user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  },
  secret: string,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionPayload = {
    sub: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  };
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSHA256(`${encHeader}.${encPayload}`, secret);
  return `${encHeader}.${encPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expectedSig = await hmacSHA256(`${header}.${payload}`, secret);
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(base64UrlDecode(payload)) as SessionPayload;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function getRedirectUri(origin: string): string {
  return `${origin}/api/auth/discord/callback`;
}
