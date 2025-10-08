import React, { useEffect } from "react";
import FolioCard from "./FolioCard";
import Title from "../ui/Title";
import { useView } from "@/contexts/ViewContext";

// @ts-ignore
import "intersection-observer";
import { useInView } from "react-intersection-observer";
import Timeline from "./Timeline";

export default function Works() {
  const { setSectionInView } = useView();

  const works = [
    {
      title: "Anonymous application",
      gitlink: "https://github.com/Sujan29k/anonymus-app.git",
      liveLink: "#",
      about:
        "A simple anonymous application that allows users to send messages without revealing their identity. It features a clean design and easy navigation, making it user-friendly.",
      stack: ["next.js", "javascript", "shadcn ui", "tailwindcss"],
      img: "/anonymus.png",
      owner: "Me",
    },
    {
      title: "fitness Tracker",
      liveLink: "#",
      gitlink: "https://github.com/Sujan29k/Fitness-Tracker.git",
      about:
        "A fitness tracker application that helps users monitor their workouts, nutrition, and progress. It features a sleek design and intuitive user interface, making it easy to track fitness goals.",
      stack: ["next.js", "typescript", "framer motion", "tailwindcss"],
      img: "/fitness.png",
      owner: "No one",
    },
    {
      title: "Expense Tracker",
      gitLink: "https://github.com/Sujan29k/financemanager.git",
      liveLink: "#",
      about:
        "An expense tracker application that allows users to manage their finances effectively. It features a user-friendly interface, enabling users to track their expenses and income easily.",
      stack: ["next.js", "typescript", "framer motion", "tailwindcss"],
      img: "/finance.png",
    },

    {
      title: "Jadi Mart",
      gitLink: "https://github.com/Sujan29k/financemanager.git",
      liveLink: "#",
      about:
        "Simple ecommerce site for selling products online for a product selling company. I made it user-friendly and attractive design for users.",
      stack: ["next.js", "typescript", "framer motion", "tailwindcss"],
      img: "/jadimart.png",
    },
    {
      title: "Chess_Engine",
      gitLink: "https://github.com/Sujan29k/Chess_Engine.git",
      liveLink: "#",
      about:
        "A chess engine built using Python that allows users to play chess against the computer. It features a simple and intuitive interface, making it easy for users to enjoy a game of chess.",
      stack: ["next.js", "typescript", "framer motion", "tailwindcss","stockfish","websockets","chess.js"],
      img: "/chessengine.png",
    },

    // {
    //   title: "Yourtodo",
    //   gitLink: "https://github.com/adex-hub/Yourtodo",
    //   liveLink: "https://yourtodo-v1.vercel.app/",
    //   about:
    //     "This task management system lets you customize your name, add, delete, and edit tasks, and celebrates you when tasks are completed. It features built-in notifications and stores data in the browser, allowing you to resume tasks conveniently. Designed and developed by yours truly.",
    //   stack: ["react", "javascript", "figma", "sass"],
    //   img: "/todo.svg",
    // },
  ];

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
      {works.map((work, index) => (
        <FolioCard
          key={index}
          img={work.img}
          title={work.title}
          gitLink={work.gitLink}
          liveLink={work.liveLink}
          about={work.about}
          stack={work.stack}
          owner={work.owner}
        />
      ))}

      <Timeline />
    </section>
  );
}
