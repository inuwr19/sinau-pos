// src/pages/admin/CategoryList.tsx
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type Category = { id: number; name: string; slug?: string };

export default function CategoryList(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/admin/categories?q=${encodeURIComponent(q)}`;
      const res = await fetchJson<{ data: Category[] } | Category[]>(url, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });

      const data = Array.isArray(res) ? res : res.data ?? [];
      setCategories(data);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat categories');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await fetchJson(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      load();
    } catch (err) {
      alert('Gagal menghapus: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Kategori Menu</h1>
          <p className="text-sm text-slate-400">
            Kelola kategori untuk mengelompokkan menu di semua cabang.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/categories/new')}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
          />
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center justify-center rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          Cari
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Memuat kategori...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-sm text-slate-400 text-center">
            Belum ada kategori. Tambahkan kategori pertama Anda.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr
                  key={c.id}
                  className={
                    'border-b border-slate-800/80 ' +
                    (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                  }
                >
                  <td className="px-4 py-3 text-slate-100">
                    <div className="font-medium">{c.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.slug ? (
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                        {c.slug}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/categories/${c.id}/edit`)}
                      className="mr-3 text-amber-300 hover:text-amber-200 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
