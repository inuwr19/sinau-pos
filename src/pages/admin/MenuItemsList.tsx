/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/MenuItemsList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';
import type { Item } from '../../types';

export default function MenuItemsList(): JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [perPage] = useState(25);
  const [meta, setMeta] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  const load = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/admin/menu-items?page=${page}&per_page=${perPage}&q=${encodeURIComponent(
        q,
      )}`;
      const res = await fetchJson<{ data: Item[]; meta?: any; links?: any }>(url, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      setItems(res.data || []);
      setMeta(res.meta ?? null);
    } catch (err) {
      console.error('Failed to load menu items', err);
      alert((err as Error).message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Hapus menu item ini?')) return;
    try {
      await fetchJson(`${API_URL}/admin/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      // reload current page
      load();
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Gagal menghapus item: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Menu Items</h1>
          <p className="text-sm text-slate-400">
            Kelola daftar menu untuk semua cabang Sinau Cafe.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/menu-items/new')}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          + Tambah Item
        </button>
      </div>

      {/* Search + actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama menu..."
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-400 text-center">Memuat menu items...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Gambar</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Harga</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400 bg-slate-900/40"
                  >
                    Tidak ada menu item.
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr
                    key={it.id}
                    className={
                      'border-b border-slate-800/80 ' +
                      (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                    }
                  >
                    <td className="px-4 py-3">
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.name}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-800"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-800/60 border border-slate-700 flex items-center justify-center rounded-xl text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-100">
                      <div className="font-medium">{it.name}</div>
                      {it.description && (
                        <div className="text-xs text-slate-400 line-clamp-2">{it.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {(it.category && (it.category as any).name) ?? (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-100">
                      Rp {Number(it.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                          (it.is_available
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700/70 text-slate-300 border border-slate-600')
                        }
                      >
                        {it.is_available ? 'Tersedia' : 'Tidak tersedia'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <button
                        onClick={() => navigate(`/admin/menu-items/${it.id}/edit`)}
                        className="mr-3 text-amber-300 hover:text-amber-200 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(it.id as unknown as number)}
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

      {/* Pagination */}
      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          {meta && meta.total
            ? `Menampilkan ${meta.from} - ${meta.to} dari ${meta.total} menu`
            : null}
        </div>
        <div className="space-x-2">
          <button
            disabled={!meta?.prev_page_url}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
          >
            Prev
          </button>
          <button
            disabled={!meta?.next_page_url}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
