"use client";
import Link from "next/link";
import { FiUser, FiFolder, FiBriefcase, FiZap, FiArrowRight } from "react-icons/fi";

const sections = [
  {
    name: "Projects",
    path: "/admin/projects",
    icon: <FiFolder className="w-6 h-6" />,
    desc: "Add, edit or remove portfolio projects",
    color: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
    bgIcon: "bg-blue-500/10 text-blue-400",
  },
  {
    name: "Experience",
    path: "/admin/experience",
    icon: <FiBriefcase className="w-6 h-6" />,
    desc: "Manage work history & timeline",
    color: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
    bgIcon: "bg-purple-500/10 text-purple-400",
  },
  {
    name: "Skills",
    path: "/admin/skills",
    icon: <FiZap className="w-6 h-6" />,
    desc: "Update skill categories and tools",
    color: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-400",
    bgIcon: "bg-yellow-500/10 text-yellow-400",
  },
  {
    name: "Hero",
    path: "/admin/hero",
    icon: <FiUser className="w-6 h-6" />,
    desc: "Edit your name, subtitle and photo",
    color: "from-teal-500/10 to-teal-600/5 border-teal-500/20 text-teal-400",
    bgIcon: "bg-teal-500/10 text-teal-400",
  },
];

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-medium mb-2 tracking-tight text-white/90">
          Good to see you, Sujan.
        </h1>
        <p className="text-white/40 text-sm">
          Select a section below to refine your portfolio content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((s) => (
          <Link key={s.path} href={s.path}>
            <div
              className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${s.color} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer backdrop-blur-sm`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${s.bgIcon}`}>
                {s.icon}
              </div>
              <h2 className="text-xl font-semibold mb-1 tracking-tight text-white/90">{s.name}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              <div className={`absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 ${s.color.split(" ").pop()}`}>
                <FiArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}