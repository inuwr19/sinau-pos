// src/pages/admin/BranchForm.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type Branch = { id?: number; name: string; code?: string; address?: string; phone?: string };

export default function BranchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Branch>({ name: '', code: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<Branch>(`${API_URL}/admin/branches/${id}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setForm(data);
    } catch (err) {
      alert('Gagal muat data cabang');
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await fetchJson(`${API_URL}/admin/branches/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(form),
        });
      } else {
        await fetchJson(`${API_URL}/admin/branches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(form),
        });
      }
      navigate('/admin/branches');
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
            {isEdit ? 'Edit Cabang' : 'Tambah Cabang'}
          </h2>
          <p className="text-xs text-slate-400">
            Isi informasi cabang dengan lengkap untuk memudahkan operasional.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">Nama Cabang *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Kode Cabang (opsional)
          </label>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">Alamat</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            No. Telepon (opsional)
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            onClick={() => navigate('/admin/branches')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
