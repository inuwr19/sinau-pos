/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PaymentModal.tsx
import { Banknote, Smartphone, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL, fetchJson, getAuthHeader, MIDTRANS_CLIENT_KEY } from '../lib/api';
import type { CartItem, Member } from '../types';

export type OrderResponse = {
  id?: number;
  order_number?: string;
  snap_token?: string | null;
  [k: string]: unknown;
};

interface PaymentModalProps {
  cart: CartItem[];
  member: Member | null;
  subtotal: number;
  memberDiscount: number;
  redeemDiscount: number;
  total: number;
  onClose: () => void;
  onSuccess: (order: OrderResponse, status: 'success' | 'pending') => void;
  redeemPoints: boolean;
}

type PaymentMethod = 'cash' | 'va' | 'qris';

type OrderItemPayload = {
  menu_item_id: number | string;
  qty: number;
  notes?: string | null;
};

type OrderPayload = {
  items: OrderItemPayload[];
  member_phone?: string | null;
  payment_method?: PaymentMethod;
  cash_received?: number | null;
  branch_id?: number | null;
  created_by?: number | null;
  redeem_points?: boolean | null;
};

type SnapPayOptions = {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: SnapPayOptions) => void;
    };
  }
}

const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

async function loadMidtransSnap(clientKey: string): Promise<void> {
  if (window.snap) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.body.appendChild(script);
  });
}

export default function PaymentModal({
  cart,
  member,
  subtotal,
  memberDiscount,
  redeemDiscount,
  total,
  redeemPoints,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { user, branch } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const change = cashAmount ? Math.max(0, parseFloat(cashAmount) - total) : 0;

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) {
      alert('Jumlah tunai kurang dari total.');
      return;
    }

    setLoading(true);

    try {
      const itemsPayload: OrderItemPayload[] = cart.map((ci) => ({
        menu_item_id: ci.item.id,
        qty: ci.quantity,
        notes: ci.notes ?? null,
      }));

      const payload: OrderPayload = {
        items: itemsPayload,
        member_phone: member?.phone ?? null,
        payment_method: paymentMethod,
        branch_id: branch?.id ?? null,
        created_by: user?.id ?? null,
      };

      if (redeemPoints && member && member.points >= 100 && redeemDiscount >= 30000) {
        payload.redeem_points = true;
      }

      if (paymentMethod === 'cash') {
        payload.cash_received = Number(cashAmount || 0);
      }

      const order = await fetchJson<OrderResponse>(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      console.log('Order created', order?.order_number ?? order?.id ?? order);

      // CASE 1: TUNAI – langsung sukses
      if (paymentMethod === 'cash') {
        onSuccess(order, 'success');
        onClose();
        return;
      }

      // CASE 2: NON-TUNAI – Midtrans Snap
      const snapToken = order.snap_token;
      if (!snapToken) {
        throw new Error('Snap token tidak tersedia dari server');
      }
      if (!MIDTRANS_CLIENT_KEY) {
        throw new Error('MIDTRANS client key belum diset di frontend (.env)');
      }

      await loadMidtransSnap(MIDTRANS_CLIENT_KEY);

      window.snap?.pay(snapToken, {
        onSuccess: async (result: any) => {
          try {
            await fetchJson(`${API_URL}/payments/midtrans/confirm`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
              },
              body: JSON.stringify(result),
            });
          } catch (e) {
            console.error('Failed confirm payment to backend', e);
            alert('Pembayaran berhasil di Midtrans, tetapi gagal update status di server.');
          }

          onSuccess(order, 'success');
          onClose();
        },
        onPending: async (result: any) => {
          console.log('Midtrans pending', result);
          try {
            await fetchJson(`${API_URL}/payments/midtrans/confirm`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
              },
              body: JSON.stringify(result),
            });
          } catch (e) {
            console.error('Failed confirm pending to backend', e);
          }

          onSuccess(order, 'pending');
          onClose();
        },
        onError: (result: any) => {
          console.error('Midtrans error', result);
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          console.log('Midtrans popup closed');
        },
      });
    } catch (err) {
      console.error('Payment error:', err);
      alert((err as Error)?.message ?? 'Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'cash' as PaymentMethod,
      name: 'Tunai',
      icon: Wallet,
      subtitle: 'Bayar langsung dengan uang cash',
    },
    {
      id: 'va' as PaymentMethod,
      name: 'VA Bank',
      icon: Banknote,
      subtitle: 'Virtual Account BCA via Midtrans',
    },
    {
      id: 'qris' as PaymentMethod,
      name: 'QRIS / e-Wallet',
      icon: Smartphone,
      subtitle: 'QRIS, GoPay, ShopeePay, dll',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ringkasan total */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {memberDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Diskon Member 10%</span>
                <span className="font-medium text-green-600">-{formatPrice(memberDiscount)}</span>
              </div>
            )}
            {redeemDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Diskon Tukar 100 Poin</span>
                <span className="font-medium text-blue-600">-{formatPrice(redeemDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-amber-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Pilihan metode */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      active
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${active ? 'text-amber-600' : 'text-gray-400'}`}
                    />
                    <p
                      className={`text-xs font-semibold ${
                        active ? 'text-amber-700' : 'text-gray-700'
                      }`}
                    >
                      {method.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">{method.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail khusus per metode */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Jumlah Tunai</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              {cashAmount && parseFloat(cashAmount) >= total && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Kembalian</span>
                    <span className="font-bold text-green-600">{formatPrice(change)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'va' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-blue-800">Virtual Account BCA</p>
              <p className="text-blue-700">
                Setelah klik <span className="font-semibold">Konfirmasi Pembayaran</span>, kode VA
                BCA akan muncul di popup Midtrans. Berikan kode tersebut ke customer untuk dibayar
                via m-Banking / ATM.
              </p>
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-purple-800">QRIS / e-Wallet</p>
              <p className="text-purple-700">
                Setelah klik <span className="font-semibold">Konfirmasi Pembayaran</span>, popup
                Midtrans akan menampilkan QRIS atau pilihan e-Wallet (GoPay, ShopeePay, dll) untuk
                discan oleh customer.
              </p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={
              loading ||
              (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total))
            }
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </button>
        </div>
      </div>
    </div>
  );
}
