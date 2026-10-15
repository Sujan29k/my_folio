import { NextRequest, NextResponse } from "next/server";
import { createSession, passwordMatches, sameOrigin, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return json({ error: "Invalid login request" }, 400);
  }
  if (typeof password !== "string" || password.length > 1024) return json({ error: "Wrong password" }, 401);
  try {
    if (!passwordMatches(password)) return json({ error: "Wrong password" }, 401);
    const response = json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    return response;
  } catch {
    return json({ error: "Admin login is not configured on the server" }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const response = json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
