import "server-only";

export function backendUrl() {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error("Set API_URL or NEXT_PUBLIC_API_URL to the Render backend URL");
  }
  return (url || "http://localhost:3001").replace(/\/+$/, "");
}
