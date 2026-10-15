import Hero from "../components/hero-section/Hero";
import Works from "../components/work-section/Works";
import About from "../components/about-section/About";
import Contact from "../components/contact+footer/Contact";
import Footer from "../components/contact+footer/Footer";
import PortfolioCursor from "../components/PortfolioCursor";
import { unstable_noStore as noStore } from "next/cache";
import { getHero, getProjects, getExperience, getSkills, getResume } from "@/lib/server/portfolio";

export default async function Home() {
  // Skip the Full Route Cache, retaining each section's independent Data Cache TTL.
  noStore();
  const [hero, projects, experience, skills, resume] = await Promise.all([
    getHero(), getProjects(), getExperience(), getSkills(), getResume(),
  ]);

  return (
    <main className="overflow-x-hidden sm:overflow-x-visible">
      <PortfolioCursor />
      <Hero result={hero} />
      <Works result={projects} experience={experience} />
      <About skillsResult={skills} resumeResult={resume} />
      <Contact />
      <Footer />
    </main>
  );
}
