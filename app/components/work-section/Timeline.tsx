"use client";
import { Syne } from "next/font/google";
import Title from "../ui/Title";
import TimelineItem from "./TimelineItem";
import { useEffect, useState } from "react";
import { getExperience, type Experience } from "@/lib/api";

const syne = Syne({ subsets: ["latin"] });

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Present";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function Timeline() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getExperience()
      .then((data) => {
        setExperience(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-10 md:mt-[110px]">
      <Title> Work experience</Title>

      {loading && (
        <div className="flex flex-col gap-6 mt-6 pl-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-full rounded-[12px] bg-white/5 animate-pulse h-[120px]"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-white/40 text-xl mt-6">
          Could not load work experience. Please try again later.
        </p>
      )}

      {!loading && !error && (
        <div className="flex mt-6 gap-4 pl-3">
          <div className="w-3 h-auto bg-linear-to-b from-white to-transparent" />

          <div className="flex flex-col gap-10">
            {experience.map((item) => (
              <TimelineItem
                key={item.id}
                companyImg={item.logo_url || "/position-icon.svg"}
                jobTitle={item.role}
                company={item.company}
                jobType={item.role}
                duration={`${formatDate(item.start_date)} – ${formatDate(item.end_date)}`}
                stuffIDid={
                  item.description
                    ? item.description
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [item.description || ""]
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
