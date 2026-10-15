"use client";
import React, { useEffect } from "react";
import FolioCard from "./FolioCard";
import Title from "../ui/Title";
import { useView } from "@/contexts/ViewContext";

// @ts-ignore
import "intersection-observer";
import { useInView } from "react-intersection-observer";
import Timeline from "./Timeline";
import type { Project, Experience, PublicResult } from "@/lib/api";
import Link from "next/link";

export default function Works({ result, experience }: {
  result: PublicResult<Project[]>;
  experience: PublicResult<Experience[]>;
}) {
  const { setSectionInView } = useView();
  const { data: projects, error } = result;

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  useEffect(() => {
    if (inView) setSectionInView("work");
  }, [inView, setSectionInView]);

  const PREVIEW_COUNT = 4;
  const hasMore = (projects?.length ?? 0) > PREVIEW_COUNT;

  return (
    <section
      className="flex flex-col gap-6 md:gap-10 pt-[110px]"
      ref={ref}
      id="work"
    >
      <div className="flex items-end justify-between gap-4">
        <Title>Projects</Title>
        {projects && projects.length > 0 && (
          <span className="text-white/30 text-sm font-medium pb-1 shrink-0">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <p className="text-white/40 text-xl">
          {error}
        </p>
      )}

      {projects &&
        projects.slice(0, PREVIEW_COUNT).map((project) => (
          <FolioCard
            key={project.id}
            img={project.image_url || "/placeholder.png"}
            title={project.title}
            gitLink={project.github_url || undefined}
            liveLink={project.live_url || "#"}
            about={project.description || ""}
            stack={project.tech_stack || []}
          />
        ))}

      {hasMore && (
        <div className="flex justify-center mt-2 mb-6">
          <Link
            href="/projects"
            className="group flex items-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all duration-300 font-medium tracking-wide"
          >
            See All Projects
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <Timeline result={experience} />
    </section>
  );
}
