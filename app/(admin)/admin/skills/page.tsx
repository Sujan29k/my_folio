'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Skill {
  id?: number;
  category: string;
  items: string[];
}

const empty: Skill = { category: '', items: [] };

export default function AdminSkills() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<Skill>(empty);
  const [itemsInput, setItemsInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login');
    } else {
      fetchSkills();
    }
  }, []);

  const fetchSkills = async () => {
    const res = await fetch(`${API}/api/about/skills`);
    const data = await res.json();
    setSkills(data);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSubmit = async () => {
    if (!form.category) return;
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API}/api/about/skills/${editingId}`
      : `${API}/api/about/skills`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      showMessage(editingId ? '✓ Updated!' : '✓ Category added!', 'success');
      reset();
      fetchSkills();
    } catch {
      showMessage('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: Skill) => {
    setForm(s);
    setItemsInput(s.items.join(', '));
    setEditingId(s.id!);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill category?')) return;
    await fetch(`${API}/api/about/skills/${id}`, { method: 'DELETE' });
    fetchSkills();
  };

  const reset = () => {
    setForm(empty);
    setItemsInput('');
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-white">
      <header className="border-b border-white/10 px-8 py-4 flex items-center gap-4 bg-[#070d14]/90 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => router.push('/admin')} className="text-white/40 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <div className="w-px h-5 bg-white/20" />
        <h1 className="text-lg font-bold">⚡ Skills</h1>
        <span className="ml-auto text-xs text-white/30">{skills.length} categor{skills.length !== 1 ? 'ies' : 'y'}</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        {message && (
          <div className={`px-5 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">{editingId ? '✏️ Edit Category' : '+ Add Skill Category'}</h2>

          <div className="flex flex-col gap-4">
            <input
              placeholder="Category Name * (e.g. Frontend Tools)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60"
            />
            <div>
              <input
                placeholder="Skills — comma separated (e.g. React, TypeScript, Next.js)"
                value={itemsInput}
                onChange={(e) => {
                  setItemsInput(e.target.value);
                  setForm({ ...form, items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) });
                }}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60"
              />
              {form.items.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.items.map((item) => (
                    <span key={item} className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.category}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Saving…' : editingId ? 'Update' : 'Add Category'}
            </button>
            {editingId && (
              <button onClick={reset} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm text-white/40 uppercase tracking-widest">All Categories</h2>
          {skills.length === 0 && (
            <p className="text-white/30 text-center py-10 border border-dashed border-white/10 rounded-2xl">
              No skill categories yet.
            </p>
          )}
          {skills.map((s) => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-2">{s.category}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map((item) => (
                      <span key={item} className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-full border border-white/10">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(s)} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors">Edit</button>
                  <button onClick={() => handleDelete(s.id!)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
