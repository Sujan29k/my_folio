"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { FiHome, FiUser, FiFolder, FiBriefcase, FiZap, FiLogOut, FiExternalLink } from "react-icons/fi";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: <FiHome className="w-4 h-4" /> },
  { name: "Hero", path: "/admin/hero", icon: <FiUser className="w-4 h-4" /> },
  { name: "Projects", path: "/admin/projects", icon: <FiFolder className="w-4 h-4" /> },
  { name: "Experience", path: "/admin/experience", icon: <FiBriefcase className="w-4 h-4" /> },
  { name: "Skills", path: "/admin/skills", icon: <FiZap className="w-4 h-4" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin_auth") !== "true") {
      router.push("/admin/login");
      return;
    }
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#070d14] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a111a] border-r border-white/5 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              A
            </div>
            <span className="font-bold text-white/90 tracking-wide">Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-2">
            Menu
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={isActive ? "opacity-100" : "opacity-70"}>{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-semibold"
          >
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#070d14]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm font-medium">
              {navItems.find((n) => n.path === pathname)?.name || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              {time}
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-sm font-medium text-white/60 hover:text-white flex items-center gap-2 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              View site <FiExternalLink className="opacity-50" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
