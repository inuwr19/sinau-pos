// src/pages/admin/BranchList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type Branch = { id: number; name: string; code?: string; address?: string };

export default function BranchList() {
  const [data, setData] = useState<{
    links?: any;
    data: Branch[];
    meta?: any;
  }>({ data: [] });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  const load = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/admin/branches?page=${page}&q=${encodeURIComponent(q)}`;
      const res = await fetchJson(url, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setData(res);
    } catch (err) {
      console.error('Load branches', err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Hapus cabang ini?')) return;
    try {
      await fetchJson(`${API_URL}/admin/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      load();
    } catch (err) {
      alert('Gagal hapus: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Cabang</h1>
          <p className="text-sm text-slate-400">Kelola daftar cabang Sinau Cafe di semua lokasi.</p>
        </div>
        <Link
          to="/admin/branches/new"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          + Tambah Cabang
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / kode cabang..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
          />
        </div>
        <button
          onClick={() => setPage(1)}
          className="inline-flex items-center justify-center rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          Cari
        </button>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Memuat data cabang...</div>
        ) : data.data.length === 0 ? (
          <div className="p-6 text-sm text-slate-400 text-center">
            Belum ada cabang yang terdaftar.
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90 border-b border-slate-800">
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 text-left">Nama Cabang</th>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-left">Alamat</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={
                      'border-b border-slate-800/80 ' +
                      (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                    }
                  >
                    <td className="px-4 py-3 text-slate-100">
                      <div className="font-medium">{b.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {b.code ? (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs text-amber-300">
                          {b.code}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {b.address || <span className="text-xs text-slate-500">Belum diisi</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <button
                        onClick={() => navigate(`/admin/branches/${b.id}/edit`)}
                        className="mr-3 text-amber-300 hover:text-amber-200 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(b.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
              <div>Halaman {page}</div>
              <div className="space-x-2">
                <button
                  disabled={!data?.links?.prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
                >
                  Prev
                </button>
                <button
                  disabled={!data?.links?.next}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
