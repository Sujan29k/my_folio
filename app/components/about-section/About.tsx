"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Syne } from "next/font/google";
import { useView } from "@/contexts/ViewContext";
import { useInView } from "react-intersection-observer";
import AnimatedBody from "../ui/AnimatedBody";
import AnimatedTitle from "../ui/AnimatedTitle";
import type { Skill, Resume, PublicResult } from "@/lib/api";

const syne = Syne({ subsets: ["latin"] });

export default function About({ skillsResult, resumeResult }: {
  skillsResult: PublicResult<Skill[]>;
  resumeResult: PublicResult<Resume>;
}) {
  const { setSectionInView } = useView();
  const { data: skills, error: skillsError } = skillsResult;
  const resumeUrl = resumeResult.data?.resume_url;

  const { ref, inView } = useInView({
    threshold: 0.2,
    rootMargin: "-100px 0px",
  });

  useEffect(() => {
    if (inView) setSectionInView("about");
  }, [inView, setSectionInView]);

  return (
    <section ref={ref} className="pt-24 md:pt-[150px]" id="about">
      <AnimatedTitle
        wordSpace={"mr-[14px]"}
        charSpace={"mr-[0.001em]"}
        className={`uppercase ${syne.className} antialiased text-4xl md:text-5xl xl:text-6xl font-bold opacity-80`}
      >
        I amplify brand voices through the web
      </AnimatedTitle>
      <div className="grid grid-cols-1 lg:grid-cols-[8.5fr_3.5fr] gap-8 mt-6">
        <div className="grid grid-cols-1 antialiased gap-6 text-white/80 text-xl md:text-2xl">
          <AnimatedBody className="leading-[34px] md:leading-[39px]">
            My passion lies in creating strong business solutions that aid
            business growth. Whether it&apos;s a website to boost brand
            publicity or software solutions that streamline otherwise manual
            processes, I love taking brands from point A to the their dreamy
            point B and iteratively improve as time goes on.
          </AnimatedBody>
          <AnimatedBody className="leading-[34px] md:leading-[39px]">
            From writing my first lines of code back in late 2019 to this point
            I have continually refined my development skills overtime picking up
            UI/UX design on the way &amp; solving complex challenges increasing
            the complexity as time goes by to ensure improvement.
          </AnimatedBody>
          <AnimatedBody className="inline leading-[34px] md:leading-[39px]">
            Each challenge is unique so I ensure that I learn and grow through
            each one ensuring that I not only put in my best but also deliver
            solutions that businesses are proud to call their own. Wanna learn
            more? Here&apos;s <br className="hidden md:block" />
            {resumeResult.error ? (
              <span className="text-white/40">{resumeResult.error}</span>
            ) : resumeUrl ? (
              <Link
                className="underline"
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                my résumè
              </Link>
            ) : (
              <span className="underline opacity-40">my résumè</span>
            )}
            .
          </AnimatedBody>
        </div>

        {/* SKILLS */}
        <div className="grid grid-cols-1 gap-4">
          {skillsError && (
            <p className="text-white/40 text-base">
              {skillsError}
            </p>
          )}
          {skills &&
            skills.map((skill) => (
              <div key={skill.id}>
                <AnimatedTitle
                  wordSpace={"mr-[0.5ch]"}
                  charSpace={"mr-[0.001em]"}
                  className="font-bold antialiased text-xl md:text-2xl mb-2"
                >
                  {skill.category}
                </AnimatedTitle>
                <AnimatedBody className="text-white/60 text-base md:text-xl leading-8">
                  {skill.items.join(", ")}.
                </AnimatedBody>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}