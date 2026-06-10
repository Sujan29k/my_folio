"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { getProjects, type Project } from "@/lib/api";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"] });

export default function ProjectsPage() {
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

  return (
    <main className="min-h-screen pt-[120px] pb-20 overflow-x-hidden sm:overflow-x-visible">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-12">
        <Link
          href="/#work"
          className="text-white/40 hover:text-white/70 transition-colors text-sm font-medium flex items-center gap-1.5 w-fit mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-end justify-between gap-4">
          <h1
            className={`uppercase ${syne.className} text-4xl md:text-5xl xl:text-6xl font-bold text-white/80`}
          >
            All Projects
          </h1>
          {!loading && !error && (
            <span className="text-white/30 text-sm font-medium pb-2">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 animate-pulse h-[320px]"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-white/40 text-xl text-center py-20">
          Could not load projects. Please try again later.
        </p>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group std-backdrop-blur bg-linear-to-r from-[#d9d9d91f] to-[#7373731f] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-500 flex flex-col"
              style={{
                animationDelay: `${index * 80}ms`,
                animation: "fadeUp 0.5s ease forwards",
                opacity: 0,
              }}
            >
              {/* Image */}
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={project.image_url || "/placeholder.png"}
                  fill
                  alt={project.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay with links */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  {project.live_url && (
                    <Link
                      href={project.live_url}
                      target="_blank"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 hover:bg-white/20 transition-colors text-xl"
                    >
                      <Icon icon="line-md:external-link-rounded" />
                    </Link>
                  )}
                  {project.github_url && (
                    <Link
                      href={project.github_url}
                      target="_blank"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 hover:bg-white/20 transition-colors text-xl"
                    >
                      <Icon icon="mingcute:github-line" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h2 className="text-xl font-bold text-white/90 tracking-tight">
                  {project.title}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-3 flex-1">
                  {project.description}
                </p>
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-1">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="uppercase text-[11px] font-semibold bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
