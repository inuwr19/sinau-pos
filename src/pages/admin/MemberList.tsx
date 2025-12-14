// src/pages/admin/MemberList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type MemberRow = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  points: number;
};

export default function MemberList(): JSX.Element {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchJson<MemberRow[] | { data: MemberRow[] }>(`${API_URL}/admin/members`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      setMembers(Array.isArray(res) ? res : res.data ?? []);
    } catch (err) {
      alert('Gagal memuat members: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Hapus member ini?')) return;
    try {
      await fetchJson(`${API_URL}/admin/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
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
          <h1 className="text-2xl font-semibold text-slate-100">Members</h1>
          <p className="text-sm text-slate-400">Kelola data member dan poin loyalti pelanggan.</p>
        </div>
        <button
          onClick={() => navigate('/admin/members/new')}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          + Tambah Member
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Memuat members...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Telepon</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Poin</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-400 bg-slate-900/40"
                  >
                    Tidak ada member
                  </td>
                </tr>
              ) : (
                members.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={
                      'border-b border-slate-800/80 ' +
                      (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                    }
                  >
                    <td className="px-4 py-3 text-slate-100">
                      <div className="font-medium">{m.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{m.phone}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {m.email ?? <span className="text-xs text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-200 font-semibold">
                      {m.points.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <button
                        onClick={() => navigate(`/admin/members/${m.id}/edit`)}
                        className="mr-3 text-amber-300 hover:text-amber-200 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(m.id)}
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
