import "server-only";
import { unstable_cache } from "next/cache";
import { backendUrl } from "./backend";
import type { Hero, Project, Experience, Skill, Resume, PublicResult } from "@/lib/api";

type Row = Record<string, unknown>;
const object = (value: unknown): value is Row =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const row = (value: unknown, required: string[], optional: string[] = []) =>
  object(value) && typeof value.id === "number" &&
  required.every((key) => typeof value[key] === "string") &&
  optional.every((key) => value[key] === null || typeof value[key] === "string");

// Cache the validated value, not the raw HTTP response. A 500, malformed JSON,
// or even a 200 error payload throws before unstable_cache can store it.
function cachedSection<T>(path: string, tag: string, seconds: number, valid: (data: unknown) => boolean) {
  return (url: string) => unstable_cache(async () => {
    const response = await fetch(`${url}/api/${path}`, {
      // The outer unstable_cache owns caching. Avoid a second raw-response cache.
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`${path}: backend returned HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!valid(data)) throw new Error(`${path}: invalid backend response`);
    return data as T;
  }, ["portfolio-v1", url, path], { revalidate: seconds, tags: [tag] })();
}

const hero = cachedSection<Hero>("hero", "hero", 3600, (v) =>
  row(v, ["name"], ["subtitle", "image_url", "github_url"]));
const projects = cachedSection<Project[]>("projects", "projects", 900, (v) =>
  Array.isArray(v) && v.every((p) => row(p, ["title"], ["description", "live_url", "github_url", "image_url"]) &&
    (p.tech_stack === null || strings(p.tech_stack))));
const experience = cachedSection<Experience[]>("experience", "experience", 900, (v) =>
  Array.isArray(v) && v.every((e) => row(e, ["company", "role"], ["description", "start_date", "end_date", "logo_url"])));
const skills = cachedSection<Skill[]>("about/skills", "skills", 3600, (v) =>
  Array.isArray(v) && v.every((s) => row(s, ["category"]) && strings(s.items)));
const resume = cachedSection<Resume>("about/resume", "resume", 3600, (v) =>
  object(v) && (v.resume_url === null || typeof v.resume_url === "string"));

// Catch outside the cache: error UI is per-request and can recover immediately.
async function read<T>(section: string, load: (url: string) => Promise<T>): Promise<PublicResult<T>> {
  try {
    return { data: await load(backendUrl()), error: null };
  } catch (error) {
    console.error(`Public ${section} unavailable:`, error instanceof Error ? error.message : "Unknown error");
    return { data: null, error: `Could not load ${section}. Please try again later.` };
  }
}

export const getHero = () => read("hero data", hero);
export const getProjects = () => read("projects", projects);
export const getExperience = () => read("work experience", experience);
export const getSkills = () => read("skills", skills);
export const getResume = () => read("résumé link", resume);
