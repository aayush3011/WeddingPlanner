const COOKIE_NAME = "wedding_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

type StoredUser = { username: string; salt: string; hash: string };

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(process.env.AUTH_USERS_JSON ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: base64UrlToBytes(salt), iterations: 120_000, hash: "SHA-256" }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}

export async function verifyLogin(username: string, password: string) {
  const user = getUsers().find((candidate) => candidate.username === username.trim().toLowerCase());
  if (!user) return false;
  const candidateHash = await passwordHash(password, user.salt);
  if (candidateHash.length !== user.hash.length) return false;
  let difference = 0;
  for (let index = 0; index < candidateHash.length; index += 1) difference |= candidateHash.charCodeAt(index) ^ user.hash.charCodeAt(index);
  return difference === 0;
}

async function sign(value: string) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function createSessionToken(username: string) {
  const payload = textToBase64Url(JSON.stringify({ username, expiresAt: Date.now() + SESSION_SECONDS * 1000 }));
  const signature = await sign(payload);
  return signature ? `${payload}.${signature}` : null;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || (await sign(payload)) !== signature) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { username: string; expiresAt: number };
    return data.expiresAt > Date.now() && getUsers().some((user) => user.username === data.username);
  } catch {
    return false;
  }
}

export function authIsConfigured() {
  return Boolean(process.env.AUTH_SESSION_SECRET && getUsers().length);
}

export const authCookie = { name: COOKIE_NAME, maxAge: SESSION_SECONDS };
