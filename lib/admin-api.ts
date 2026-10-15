"use client";

// All admin traffic uses the authenticated, uncached same-origin server proxy.
export async function adminFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api/admin/content/${path}`, { ...options, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 401) window.location.assign("/admin/login");
    throw new Error(body?.error || `Request failed (HTTP ${response.status})`);
  }
  return response;
}
