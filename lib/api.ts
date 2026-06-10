const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Hero {
  id: number;
  name: string;
  subtitle: string;
  image_url: string;
  github_url: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string;
  github_url: string;
  image_url: string;
  display_order: number;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string | null;
  logo_url: string;
  display_order: number;
}

export interface Skill {
  id: number;
  category: string;
  items: string[];
}

export async function getHero(): Promise<Hero> {
  const res = await fetch(`${BASE_URL}/api/hero`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hero data");
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/api/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function getExperience(): Promise<Experience[]> {
  const res = await fetch(`${BASE_URL}/api/experience`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experience");
  return res.json();
}

export async function getSkills(): Promise<Skill[]> {
  const res = await fetch(`${BASE_URL}/api/about/skills`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch skills");
  return res.json();
}

export async function getResume(): Promise<{ resume_url: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}/api/about/resume`);
    if (!res.ok) return { resume_url: null };
    return res.json();
  } catch {
    return { resume_url: null };
  }
}
