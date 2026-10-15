export interface Hero {
  id: number;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  github_url: string | null;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  live_url: string | null;
  github_url: string | null;
  image_url: string | null;
  display_order: number;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  logo_url: string | null;
  display_order: number;
}

export interface Skill {
  id: number;
  category: string;
  items: string[];
}

export interface Resume {
  resume_url: string | null;
}

// A failed section stays visibly unavailable; it is never cached as empty data.
export type PublicResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
