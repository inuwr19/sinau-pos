// src/pages/admin/CategoryForm.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type Category = { id?: number; name: string; slug?: string };

export default function CategoryForm(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Category>({ name: '', slug: '' });
  const [loading, setLoading] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<Category>(`${API_URL}/admin/categories/${id}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setForm(data);
    } catch (err) {
      alert('Gagal muat kategori: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        isEdit && id && id !== 'new'
          ? `${API_URL}/admin/categories/${id}`
          : `${API_URL}/admin/categories`;
      const method = isEdit ? 'PUT' : 'POST';
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(form),
      });
      navigate('/admin/categories');
    } catch (err) {
      alert('Gagal menyimpan: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <form
        onSubmit={save}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-100 mb-1">
            {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <p className="text-xs text-slate-400">
            Kategori membantu mengelompokkan menu agar lebih mudah dicari kasir dan pelanggan.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kategori *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Slug (opsional, untuk URL / integrasi)
          </label>
          <input
            value={form.slug || ''}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
