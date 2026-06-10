'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Wrong password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="bg-[#1a2a3a] p-8 rounded-xl w-96">
        <h1 className="text-white text-2xl font-bold mb-6">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full p-3 rounded-lg bg-[#0d1b2a] text-white border border-gray-600 mb-4"
        />
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}