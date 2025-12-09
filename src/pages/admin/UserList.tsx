/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/UserList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type User = { id: number; name: string; email: string; role: string; branch?: any };

export default function UserList(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchJson<{ data: User[] } | User[]>(`${API_URL}/admin/users`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setUsers(Array.isArray(res) ? res : res.data ?? []);
    } catch (err) {
      alert('Gagal memuat users: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await fetchJson(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      load();
    } catch (err) {
      alert('Gagal menghapus: ' + (err as Error).message);
    }
  };

  const roleBadgeClass = (role: string) => {
    if (role === 'admin') return 'bg-amber-500/20 text-amber-200 border-amber-500/40';
    if (role === 'manager') return 'bg-sky-500/15 text-sky-200 border-sky-500/40';
    return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Users</h1>
          <p className="text-sm text-slate-400">
            Kelola akun pengguna yang dapat mengakses sistem POS Sinau Cafe.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/users/new')}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          + Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Memuat users...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Cabang</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-400 bg-slate-900/40"
                  >
                    Tidak ada user
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={
                      'border-b border-slate-800/80 ' +
                      (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                    }
                  >
                    <td className="px-4 py-3 text-slate-100">
                      <div className="font-medium">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
                          roleBadgeClass(u.role)
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {u.branch?.name ?? <span className="text-xs text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <button
                        onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                        className="mr-3 text-amber-300 hover:text-amber-200 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
