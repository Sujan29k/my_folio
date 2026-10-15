import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin, sameOrigin } from "@/lib/server/admin-auth";
import { backendUrl } from "@/lib/server/backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Explicit route/method allowlist; never accept a caller-supplied URL or cache tag.
function section(path: string, method: string): string | null {
  if (path === "hero" && ["GET", "PUT"].includes(method)) return "hero";
  if (path === "about/resume" && ["GET", "PUT"].includes(method)) return "resume";
  if (path === "upload" && method === "POST") return "upload";
  for (const [base, tag] of [["projects", "projects"], ["experience", "experience"], ["about/skills", "skills"]]) {
    if (path === base && ["GET", "POST"].includes(method)) return tag;
    if (new RegExp(`^${base}/[1-9][0-9]*$`).test(path) && ["PUT", "DELETE"].includes(method)) return tag;
  }
  return null;
}

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

async function handle(request: NextRequest, { params }: { params: { path: string[] } }) {
  if (!isAdmin()) return json({ error: "Please log in again" }, 401);
  const mutation = request.method !== "GET";
  if (mutation && !sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const path = params.path.join("/");
  const tag = section(path, request.method);
  if (!tag) return json({ error: "Unknown admin operation" }, 404);
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return json({ error: "Admin backend access is not configured" }, 503);

  let upstream: Response;
  try {
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    upstream = await fetch(`${backendUrl()}/api/${path}`, {
      method: request.method,
      headers,
      body: mutation ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return json({ error: "Backend unavailable. Check whether the change saved before retrying." }, 502);
  }
  if (!upstream.ok) {
    return json({ error: `Backend request failed (HTTP ${upstream.status}).` }, upstream.status);
  }
  if (mutation && tag !== "upload") {
    try {
      revalidateTag(tag);
    } catch {
      return json({ error: "Saved, but public cache refresh failed. The public page will refresh after its cache expires." }, 500);
    }
  }
  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
