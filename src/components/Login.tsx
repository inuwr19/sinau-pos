/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Login.tsx
import { Coffee } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login(): JSX.Element {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('cashier.pusat@test.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);
    try {
      const me = await signIn(email, password); // now returns user or null

      if (me && (me as any).role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Email atau password salah');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                <Coffee className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Sinau Cafe</h1>
            <p className="text-gray-500">Point of Sales System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                placeholder="nama@sinaucafe.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loadingLocal}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingLocal ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
