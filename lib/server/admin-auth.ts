import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "portfolio_admin";
export const SESSION_SECONDS = 8 * 60 * 60;

function config() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) {
    throw new Error("Configure ADMIN_PASSWORD and ADMIN_SESSION_SECRET (at least 32 characters)");
  }
  return { password, secret };
}

export function sameSecret(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function passwordMatches(password: string) {
  return sameSecret(password, config().password);
}

function signature(payload: string) {
  const { secret, password } = config();
  // Changing either server credential also expires existing sessions.
  return createHmac("sha256", secret).update(`${payload}:${password}`).digest("base64url");
}

export function createSession() {
  const payload = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${payload}.${signature(payload)}`;
}

export function isAdmin() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [expiry, mac, extra] = token.split(".");
  if (extra || !/^\d+$/.test(expiry) || !mac || Number(expiry) <= Date.now() / 1000) return false;
  try {
    return sameSecret(mac, signature(expiry));
  } catch {
    return false;
  }
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
