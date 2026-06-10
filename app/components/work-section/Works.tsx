"use client";
import React, { useEffect, useState } from "react";
import FolioCard from "./FolioCard";
import Title from "../ui/Title";
import { useView } from "@/contexts/ViewContext";

// @ts-ignore
import "intersection-observer";
import { useInView } from "react-intersection-observer";
import Timeline from "./Timeline";
import { getProjects, type Project } from "@/lib/api";
import Link from "next/link";

export default function Works() {
  const { setSectionInView } = useView();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  useEffect(() => {
    if (inView) setSectionInView("work");
  }, [inView, setSectionInView]);

  const PREVIEW_COUNT = 4;
  const hasMore = projects.length > PREVIEW_COUNT;

  return (
    <section
      className="flex flex-col gap-6 md:gap-10 pt-[110px]"
      ref={ref}
      id="work"
    >
      <div className="flex items-end justify-between gap-4">
        <Title>Projects</Title>
        {!loading && !error && projects.length > 0 && (
          <span className="text-white/30 text-sm font-medium pb-1 shrink-0">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full rounded-[20px] bg-white/5 animate-pulse h-[280px]"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-white/40 text-xl">
          Could not load projects. Please try again later.
        </p>
      )}

      {!loading &&
        !error &&
        projects.slice(0, PREVIEW_COUNT).map((project) => (
          <FolioCard
            key={project.id}
            img={project.image_url || "/placeholder.png"}
            title={project.title}
            gitLink={project.github_url || undefined}
            liveLink={project.live_url || "#"}
            about={project.description}
            stack={project.tech_stack || []}
          />
        ))}

      {!loading && !error && hasMore && (
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

      <Timeline />
    </section>
  );
}
