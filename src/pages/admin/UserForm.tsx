/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/UserForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'cashier' | 'manager';
  branch_id?: number | '';
};

export default function UserForm(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'cashier',
    branch_id: '',
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    (async () => {
      try {
        const branchesRes = await fetchJson<any[]>(`${API_URL}/branches`, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        });
        setBranches(branchesRes);
      } catch (err) {
        console.warn('Failed load branches', err);
      }
    })();
    if (isEdit) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<any>(`${API_URL}/admin/users/${id}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setForm({
        name: data.name,
        email: data.email,
        role: data.role,
        branch_id: data.branch?.id ?? '',
      });
    } catch (err) {
      alert('Gagal muat user: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `${API_URL}/admin/users/${id}` : `${API_URL}/admin/users`;
      const method = isEdit ? 'PUT' : 'POST';
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(form),
      });
      navigate('/admin/users');
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
            {isEdit ? 'Edit User' : 'Tambah User'}
          </h2>
          <p className="text-xs text-slate-400">Atur akses dan hak pengguna untuk mengelola POS.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nama *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password {isEdit ? '(kosongkan jika tidak diubah)' : '*'}
            </label>
            <input
              type="password"
              value={form.password || ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              {...(isEdit ? {} : { required: true })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cabang</label>
              <select
                value={form.branch_id ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branch_id: e.target.value ? Number(e.target.value) : '',
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
              >
                <option value="">(Tidak memilih)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Admin pusat boleh tanpa cabang, kasir/manager sebaiknya punya cabang.
              </p>
            </div>
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
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
