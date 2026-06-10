'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiFolder, FiEdit2, FiTrash2, FiImage, FiPlus } from 'react-icons/fi';

interface Project {
  id?: number;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string;
  github_url: string;
  image_url: string;
  display_order: number;
}

const empty: Project = {
  title: '',
  description: '',
  tech_stack: [],
  live_url: '',
  github_url: '',
  image_url: '',
  display_order: 0,
};

export default function AdminProjects() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const fileRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<Project>(empty);
  const [techInput, setTechInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin/login');
    } else {
      fetchProjects();
    }
  }, []);

  useEffect(() => {
    setPreviewUrl(form.image_url);
  }, [form.image_url]);

  const fetchProjects = async () => {
    const res = await fetch(`${API}/api/projects`);
    const data = await res.json();
    setProjects(data);
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
      if (data.url) {
        setForm((f) => ({ ...f, image_url: data.url }));
        setPreviewUrl(data.url);
      }
    } catch {
      showMessage('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/api/projects/${editingId}` : `${API}/api/projects`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      showMessage(editingId ? '✓ Project updated!' : '✓ Project added!', 'success');
      reset();
      fetchProjects();
    } catch {
      showMessage('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    setForm(p);
    setTechInput(p.tech_stack.join(', '));
    setEditingId(p.id!);
    setPreviewUrl(p.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`${API}/api/projects/${id}`, { method: 'DELETE' });
    fetchProjects();
  };

  const reset = () => {
    setForm(empty);
    setTechInput('');
    setEditingId(null);
    setPreviewUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FiFolder className="text-blue-400" />
          Projects
        </h1>
        <span className="text-sm text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
      </div>
        {/* Toast */}
        {message && (
          <div className={`px-5 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-5 flex items-center gap-2 text-white/90">
            {editingId ? <><FiEdit2 className="text-blue-400" /> Edit Project</> : <><FiPlus className="text-blue-400" /> Add New Project</>}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Project Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="col-span-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="col-span-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 resize-none"
            />

            {/* Tech stack */}
            <div className="col-span-full">
              <input
                placeholder="Tech Stack — comma separated (e.g. React, TypeScript)"
                value={techInput}
                onChange={(e) => {
                  setTechInput(e.target.value);
                  setForm({ ...form, tech_stack: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) });
                }}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
              />
              {form.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tech_stack.map((t) => (
                    <span key={t} className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <input
              placeholder="Live URL (https://...)"
              value={form.live_url}
              onChange={(e) => setForm({ ...form, live_url: e.target.value })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
            />
            <input
              placeholder="GitHub URL (https://...)"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
            />

            {/* Image section */}
            <div className="col-span-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-white/50">Project Image</span>
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'url' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    URL
                  </button>
                  <button
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${imageMode === 'upload' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {imageMode === 'url' ? (
                <input
                  placeholder="Image URL (https://... or /screenshot.png)"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
                />
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-white/5"
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {uploading ? (
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <FiImage className="w-8 h-8 text-white/30 mb-2" />
                      <span className="text-sm text-white/50">Click to upload image (max 5MB)</span>
                      <span className="text-xs text-white/30">JPG, PNG, WebP, GIF supported</span>
                    </>
                  )}
                </div>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-white/10">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => { setForm({ ...form, image_url: '' }); setPreviewUrl(''); }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <input
              placeholder="Display Order (1, 2, 3...)"
              type="number"
              value={form.display_order || ''}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Saving…' : editingId ? 'Update Project' : 'Add Project'}
            </button>
            {editingId && (
              <button onClick={reset} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Projects list */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm text-white/40 uppercase tracking-widest">Existing Projects</h2>
          {projects.length === 0 && (
            <p className="text-white/30 text-center py-10 border border-dashed border-white/10 rounded-2xl">
              No projects yet. Add your first one above!
            </p>
          )}
          {projects.map((p) => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:border-white/20 transition-colors">
              {p.image_url && (
                <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image src={p.image_url} alt={p.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-white/40 text-sm mt-0.5 truncate">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tech_stack?.map((t) => (
                    <span key={t} className="bg-white/5 text-white/60 text-xs px-2 py-0.5 rounded-full border border-white/10">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id!)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}