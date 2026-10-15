"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import {
  easeIn,
  easeInOut,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
// @ts-ignore
import "intersection-observer";
import { useInView } from "react-intersection-observer";
import { useView } from "@/contexts/ViewContext";
import type { Hero as HeroData, PublicResult } from "@/lib/api";

export default function Hero({ result }: { result: PublicResult<HeroData> }) {
  const { data: heroData, error } = result;

  const handWaveAnimation = {
    rotate: [0, 15, -10, 15, -10, 15, -10, 15, -10, 15, 0],
    transition: {
      duration: 1.5,
      ease: easeInOut,
    },
  };

  const animateIn1 = {
    opacity: [0, 1],
    y: ["1rem", "0px"],
    transition: {
      delay: 1.5,
      duration: 0.7,
      ease: easeIn,
    },
  };

  const animateIn2 = {
    ...animateIn1,
    transition: {
      ...animateIn1.transition,
      delay: 2,
    },
  };

  const { setSectionInView } = useView();

  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
  });

  const { ref, inView } = useInView({
    threshold: 0.4,
    rootMargin: "-100px 0px",
  });

  useEffect(() => {
    if (inView) setSectionInView("home");
  }, [inView, setSectionInView]);

  const rotate = useTransform(scrollYProgress, [0, 1], ["0deg", "-15deg"]);

  const name = heroData?.name;
  const subtitle = heroData?.subtitle;
  const imageUrl = heroData?.image_url;

  return (
    <section
      ref={ref}
      className="pt-36 sm:pt-0 flex flex-col sm:flex-row h-dvh items-center gap-6 sm:justify-between"
      id="home"
    >
      <div className="text sm:w-[60%]">
        <motion.div
          className="grid grid-cols-9 w-fit smm:flex gap-2 mb-2 xl:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <p className="text-white/60 text-xl smm:text-2xl mb-3 smm:mb-0 lg:text-3xl col-span-6">
            Hey, there
          </p>
          <motion.div
            animate={handWaveAnimation}
            style={{ transformOrigin: "bottom right" }}
            className="col-span-3"
          >
            <Image
              src="/hand-wave.svg"
              width={30}
              height={30}
              alt="hand-waving"
            />
          </motion.div>
        </motion.div>

        {error ? (
          <div className="text-white/40 text-xl mt-4">
            {error}
          </div>
        ) : (
          <>
            <motion.h1
              className="text-[32px] smm:text-[40px] md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-bold"
              initial={{ opacity: 0 }}
              animate={animateIn1}
            >
              <p className="text-white/60 inline">I&apos;m </p>
              <span className="bg-linear-to-br bg-clip-text text-transparent from-[#7CC0C4] via-[#548FBA] to-[#3C84C7]">
                {name}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={animateIn2}
              className="text-white/40 text-xl smm:text-2xl lg:text-3xl xl:text-4xl mt-3 smm:mt-6"
            >
              {subtitle}
            </motion.p>
          </>
        )}
      </div>

      {/* IMAGE */}
      <div data-blobity-tooltip="Go Code">
        <motion.div
          ref={imgRef}
          style={{ rotate }}
          className="h-image flex items-center w-[380px] h-[450px] xl:w-[480px] xl:h-[580px] justify-center relative"
          initial={{ opacity: 0 }}
          animate={animateIn1}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              priority
              fill
              unoptimized
              alt={`${name}'s picture`}
              className="bg-image-radial px-8 pt-16"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
