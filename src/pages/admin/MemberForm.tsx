/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/MemberForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type MemberFormData = {
  name: string;
  phone: string;
  email: string;
  points: number;
};

export default function MemberForm(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<MemberFormData>({
    name: '',
    phone: '',
    email: '',
    points: 0,
  });
  const [loading, setLoading] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<any>(`${API_URL}/admin/members/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        points: data.points ?? 0,
      });
    } catch (err) {
      alert('Gagal memuat member: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `${API_URL}/admin/members/${id}` : `${API_URL}/admin/members`;
      const method = isEdit ? 'PUT' : 'POST';

      await fetchJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(form),
      });

      navigate('/admin/members');
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
            {isEdit ? 'Edit Member' : 'Tambah Member'}
          </h2>
          <p className="text-xs text-slate-400">
            Catat data pelanggan untuk program membership dan poin.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nama *</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Telepon *</label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              placeholder="08123456789"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Nomor ini digunakan saat pencarian member di POS.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Poin</label>
            <input
              type="number"
              min={0}
              value={form.points}
              onChange={(e) =>
                setForm({
                  ...form,
                  points: Number(e.target.value || 0),
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Admin dapat menyesuaikan poin secara manual (misalnya koreksi).
            </p>
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
            onClick={() => navigate('/admin/members')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
