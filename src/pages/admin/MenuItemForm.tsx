/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/admin/MenuItemForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader, postForm } from '../../lib/api';
import type { Category, Item } from '../../types';

export default function MenuItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [item, setItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchJson<Category[]>(`${API_URL}/categories`, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        });
        setCategories(cats);
      } catch (err) {
        console.warn(err);
      }
    })();
    if (isEdit) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<Item>(`${API_URL}/admin/menu-items/${id}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setItem(data);
    } catch (err) {
      alert('Gagal muat menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', String(item.name || ''));
      fd.append('description', String(item.description || ''));
      fd.append('price', String(item.price || 0));
      fd.append('category_id', String(item.category_id || ''));

      if (file) {
        fd.append('image', file);
      }

      const isEdit = id && id !== 'new';
      const url = isEdit ? `${API_URL}/admin/menu-items/${id}` : `${API_URL}/admin/menu-items`;

      if (isEdit) {
        fd.append('_method', 'PUT');
      }

      await postForm(url, fd);

      navigate('/admin/menu-items');
    } catch (err) {
      alert('Gagal simpan: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-100 mb-1">
            {isEdit ? 'Edit Menu Item' : 'Tambah Menu Item'}
          </h2>
          <p className="text-xs text-slate-400">
            Lengkapi detail menu untuk ditampilkan di kasir dan katalog.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama *</label>
              <input
                value={item.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kategori *</label>
              <select
                value={String(item.category_id || '')}
                onChange={(e) => setItem({ ...item, category_id: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Harga *</label>
              <input
                type="number"
                value={item.price ?? 0}
                onChange={(e) => setItem({ ...item, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi</label>
              <textarea
                value={item.description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
                rows={4}
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Gambar (opsional)
            </label>
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-400">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/90 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-amber-600"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Format: JPG/PNG, disarankan ukuran square agar tampilan rapi.
              </p>
            </div>

            {(item as any).image_url && (
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Preview saat ini:</p>
                <img
                  src={(item as any).image_url}
                  alt="preview"
                  className="w-40 h-40 object-cover rounded-xl border border-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/menu-items')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
