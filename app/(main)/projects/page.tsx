import { unstable_noStore as noStore } from "next/cache";
import { getProjects } from "@/lib/server/portfolio";
import ProjectsPage from "@/app/components/work-section/ProjectsPage";

export default async function Projects() {
  noStore();
  return <ProjectsPage result={await getProjects()} />;
}
