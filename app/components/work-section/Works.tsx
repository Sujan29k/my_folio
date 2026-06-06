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

  return (
    <section
      className="flex flex-col gap-6 md:gap-10 pt-[110px]"
      ref={ref}
      id="work"
    >
      <Title>Projects</Title>

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
        projects.map((project) => (
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

      <Timeline />
    </section>
  );
}
