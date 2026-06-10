'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Experience {
  id?: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string;
  logo_url: string;
  display_order: number;
}

const empty: Experience = {
  company: '',
  role: '',
  description: '',
  start_date: '',
  end_date: '',
  logo_url: '',
  display_order: 0,
};

function fmtDate(d: string | null) {
  if (!d) return 'Present';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function AdminExperience() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Experience[]>([]);
  const [form, setForm] = useState<Experience>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login');
    } else {
      fetchItems();
    }
  }, []);

  const fetchItems = async () => {
    const res = await fetch(`${API}/api/experience`);
    const data = await res.json();
    setItems(data);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, logo_url: data.url }));
    } catch {
      showMessage('Logo upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.company || !form.role) return;
    setLoading(true);
    const payload = { ...form, end_date: isCurrent ? null : form.end_date || null };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/api/experience/${editingId}` : `${API}/api/experience`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showMessage(editingId ? '✓ Updated!' : '✓ Added!', 'success');
      reset();
      fetchItems();
    } catch {
      showMessage('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Experience) => {
    setForm(item);
    setIsCurrent(!item.end_date);
    setEditingId(item.id!);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience entry?')) return;
    await fetch(`${API}/api/experience/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setIsCurrent(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-white">
      <header className="border-b border-white/10 px-8 py-4 flex items-center gap-4 bg-[#070d14]/90 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => router.push('/admin')} className="text-white/40 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <div className="w-px h-5 bg-white/20" />
        <h1 className="text-lg font-bold">💼 Work Experience</h1>
        <span className="ml-auto text-xs text-white/30">{items.length} entr{items.length !== 1 ? 'ies' : 'y'}</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        {message && (
          <div className={`px-5 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">{editingId ? '✏️ Edit Entry' : '+ Add Experience'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Company Name *"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"
            />
            <input
              placeholder="Role / Job Title *"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"
            />
            <textarea
              placeholder="Description (use new lines for bullet points)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="col-span-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 resize-none"
            />

            <div>
              <label className="text-xs text-white/40 mb-1 block">Start Date</label>
              <input
                type="date"
                value={form.start_date?.slice(0, 10) || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">End Date</label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={form.end_date?.slice(0, 10) || ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  disabled={isCurrent}
                  className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/60 disabled:opacity-30"
                />
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="accent-purple-500"
                  />
                  Current
                </label>
              </div>
            </div>

            {/* Logo */}
            <div className="col-span-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-white/50">Company Logo</span>
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'url' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >URL</button>
                  <button
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'upload' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >Upload</button>
                </div>
                {form.logo_url && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 ml-auto">
                    <Image src={form.logo_url} alt="logo" fill className="object-contain" unoptimized />
                  </div>
                )}
              </div>
              {imageMode === 'url' ? (
                <input
                  placeholder="Logo URL"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"
                />
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full p-5 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors cursor-pointer flex items-center justify-center gap-2 bg-white/5"
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  {uploading
                    ? <div className="flex items-center gap-2 text-purple-400 text-sm"><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Uploading...</div>
                    : <span className="text-sm text-white/50">📷 Click to upload logo</span>
                  }
                </div>
              )}
            </div>

            <input
              placeholder="Display Order"
              type="number"
              value={form.display_order || ''}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.company || !form.role}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Saving…' : editingId ? 'Update' : 'Add Experience'}
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
          <h2 className="text-sm text-white/40 uppercase tracking-widest">Timeline</h2>
          {items.length === 0 && (
            <p className="text-white/30 text-center py-10 border border-dashed border-white/10 rounded-2xl">
              No experience entries yet.
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:border-white/20 transition-colors">
              {item.logo_url && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/10">
                  <Image src={item.logo_url} alt={item.company} fill className="object-contain p-1" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{item.role}</h3>
                <p className="text-white/50 text-sm">{item.company}</p>
                <p className="text-white/30 text-xs mt-1">
                  {fmtDate(item.start_date)} — {fmtDate(item.end_date)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(item)} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors">Edit</button>
                <button onClick={() => handleDelete(item.id!)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
