// src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { API_URL, fetchJson, getAuthHeader } from '../../lib/api';

type TodayStats = {
  orders_count: number;
  completed_orders_count: number;
  revenue: number;
  items_sold: number;
  avg_order_value: number;
};

type Totals = {
  menu_items: number;
  members: number;
  users: number;
  branches: number;
};

type RecentOrder = {
  id: number;
  order_number: string;
  total: number;
  status: string;
  branch?: { id: number; name: string } | null;
  created_at: string;
};

type DashboardData = {
  today: TodayStats;
  totals: Totals;
  recent_orders: RecentOrder[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard(): JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchJson<DashboardData>(`${API_URL}/admin/dashboard-summary`, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        });
        setData(res);
      } catch (err) {
        console.error(err);
        setError((err as Error).message || 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = data?.today;
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      {/* Header kecil */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Ringkasan Hari Ini</h1>
          <p className="text-sm text-slate-400">
            Lihat performa penjualan Sinau Cafe untuk hari ini.
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400 text-sm">
          Memuat data dashboard...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Baris 1: ringkasan hari ini */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Order Hari Ini
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">
                {today?.orders_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {today?.completed_orders_count ?? 0} selesai
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-600/40 bg-emerald-900/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-200">
                Pendapatan Hari Ini
              </p>
              <p className="mt-3 text-2xl font-semibold text-emerald-200">
                {formatCurrency(today?.revenue ?? 0)}
              </p>
              <p className="mt-1 text-xs text-emerald-200/70">
                Rata-rata {formatCurrency(today?.avg_order_value ?? 0)} / order
              </p>
            </div>

            <div className="rounded-2xl border border-sky-600/40 bg-sky-900/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-sky-200">
                Item Terjual
              </p>
              <p className="mt-3 text-3xl font-semibold text-sky-100">{today?.items_sold ?? 0}</p>
              <p className="mt-1 text-xs text-sky-200/70">Total item di semua order selesai</p>
            </div>

            <div className="rounded-2xl border border-amber-600/40 bg-amber-900/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-100">
                Order Selesai
              </p>
              <p className="mt-3 text-3xl font-semibold text-amber-100">
                {today?.completed_orders_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-amber-100/70">
                {today && today.orders_count > 0
                  ? `${Math.round(
                      (today.completed_orders_count / Math.max(1, today.orders_count)) * 100,
                    )}% dari semua order`
                  : 'Belum ada order'}
              </p>
            </div>
          </div>

          {/* Baris 2: statistik total */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">Total Menu</p>
              <p className="text-2xl font-semibold text-slate-100">{totals?.menu_items ?? 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Item aktif di seluruh cabang</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">Total Member</p>
              <p className="text-2xl font-semibold text-slate-100">{totals?.members ?? 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Pelanggan terdaftar</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">User Sistem</p>
              <p className="text-2xl font-semibold text-slate-100">{totals?.users ?? 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Admin, kasir, dan manager</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">Cabang</p>
              <p className="text-2xl font-semibold text-slate-100">{totals?.branches ?? 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Lokasi aktif Sinau Cafe</p>
            </div>
          </div>

          {/* Baris 3: order terbaru */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Order Terbaru</h2>
                <p className="text-xs text-slate-500">5 transaksi terakhir di semua cabang.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">No. Order</th>
                    <th className="px-4 py-3 text-left">Cabang</th>
                    <th className="px-4 py-3 text-left">Waktu</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-400 bg-slate-900/40"
                      >
                        Belum ada order.
                      </td>
                    </tr>
                  ) : (
                    data.recent_orders.map((o, idx) => (
                      <tr
                        key={o.id}
                        className={
                          'border-b border-slate-800/80 ' +
                          (idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20')
                        }
                      >
                        <td className="px-4 py-3 text-slate-100">{o.order_number}</td>
                        <td className="px-4 py-3 text-slate-200">
                          {o.branch?.name ?? <span className="text-slate-500 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{formatDateTime(o.created_at)}</td>
                        <td className="px-4 py-3 text-slate-100">
                          {formatCurrency(Number(o.total))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                              o.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40'
                                : o.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-200 border-amber-500/40'
                                : 'bg-red-500/10 text-red-200 border-red-500/40',
                            ].join(' ')}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
