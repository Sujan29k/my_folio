'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sections = [
  {
    name: 'Projects',
    path: '/admin/projects',
    icon: '🗂️',
    desc: 'Add, edit or remove portfolio projects',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    badge: 'blue',
  },
  {
    name: 'Experience',
    path: '/admin/experience',
    icon: '💼',
    desc: 'Manage work history & timeline',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    badge: 'purple',
  },
  {
    name: 'Skills',
    path: '/admin/skills',
    icon: '⚡',
    desc: 'Update skill categories and tools',
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    badge: 'yellow',
  },
  {
    name: 'Hero',
    path: '/admin/hero',
    icon: '👤',
    desc: 'Edit your name, subtitle and photo',
    color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    badge: 'teal',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [time, setTime] = useState('');

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login');
      return;
    }
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d14] text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10 bg-[#070d14]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <span className="font-semibold text-white/90">Admin Panel</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/40 text-sm font-mono">{time}</span>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            View site ↗
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('admin_auth');
              router.push('/admin/login');
            }}
            className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back 👋
          </h1>
          <p className="text-white/40">
            Manage your portfolio content from here. All changes go live instantly.
          </p>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sections.map((s) => (
            <Link key={s.path} href={s.path}>
              <div
                className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${s.color} hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h2 className="text-xl font-bold mb-1">{s.name}</h2>
                <p className="text-white/50 text-sm">{s.desc}</p>
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-white/60">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-10 p-5 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Quick access</p>
          <div className="flex flex-wrap gap-3">
            {sections.map((s) => (
              <Link
                key={s.path}
                href={s.path}
                className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors"
              >
                {s.icon} {s.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}