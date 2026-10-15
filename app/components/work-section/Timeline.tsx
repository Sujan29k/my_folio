"use client";
import { Syne } from "next/font/google";
import Title from "../ui/Title";
import TimelineItem from "./TimelineItem";
import type { Experience, PublicResult } from "@/lib/api";

const syne = Syne({ subsets: ["latin"] });

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Present";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function Timeline({ result }: { result: PublicResult<Experience[]> }) {
  const { data: experience, error } = result;

  return (
    <div className="mt-10 md:mt-[110px]">
      <Title> Work experience</Title>

      {error && (
        <p className="text-white/40 text-xl mt-6">
          {error}
        </p>
      )}

      {experience && (
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
