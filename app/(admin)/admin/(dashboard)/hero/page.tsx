'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiImage } from 'react-icons/fi';

interface Hero {
  id?: number;
  name: string;
  subtitle: string;
  image_url: string;
  github_url: string;
}

const empty: Hero = { name: '', subtitle: '', image_url: '', github_url: '' };

export default function AdminHero() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Hero>(empty);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetch(`${API}/api/hero`)
      .then((r) => r.json())
      .then((data) => { setForm(data || empty); setFetching(false); })
      .catch(() => setFetching(false));
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, image_url: data.url }));
    } catch {
      showMessage('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      showMessage('✓ Hero section updated!', 'success');
    } catch {
      showMessage('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FiUser className="text-teal-400" />
          Hero Section
        </h1>
      </div>
        {message && (
          <div className={`px-5 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">Edit Hero Details</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Your Name</label>
                <input
                  placeholder="e.g. Sujan Kharel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/60"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Subtitle / Role</label>
                <input
                  placeholder="e.g. a Computer Engineering Student"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/60"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">GitHub URL</label>
                <input
                  placeholder="https://github.com/..."
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              {/* Profile Photo */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-xs text-white/40">Profile Photo</label>
                  <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'url' ? 'bg-teal-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >URL</button>
                    <button
                      onClick={() => setImageMode('upload')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'upload' ? 'bg-teal-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >Upload</button>
                  </div>
                </div>

                {imageMode === 'url' ? (
                  <input
                    placeholder="Image URL or /filename.png"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/60"
                  />
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-teal-500/50 transition-colors cursor-pointer flex flex-col items-center gap-2 bg-white/5"
                  >
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {uploading
                      ? <div className="flex items-center gap-2 text-teal-400 text-sm"><div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />Uploading...</div>
                      : <><FiImage className="w-8 h-8 text-white/30 mb-2" /><span className="text-sm text-white/50">Click to upload your photo</span></>
                    }
                  </div>
                )}

                {form.image_url && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="relative w-24 h-28 rounded-xl overflow-hidden border border-white/10">
                      <Image src={form.image_url} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Preview</p>
                      <button
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live preview card */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Live Preview</p>
              <p className="text-white/50 text-sm">Hey, there 👋</p>
              <p className="text-xl font-bold mt-1">
                <span className="text-white/60">I&apos;m </span>
                <span className="bg-gradient-to-br from-[#7CC0C4] via-[#548FBA] to-[#3C84C7] bg-clip-text text-transparent">
                  {form.name || 'Your Name'}
                </span>
              </p>
              <p className="text-white font-bold">{form.subtitle || 'Your Role'}</p>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
    </div>
  );
}
