// src/components/ReceiptModal.tsx
import { CheckCircle2, Clock, Printer, X } from 'lucide-react';
import type { CartItem, Member } from '../types';
import type { OrderResponse } from './PaymentModal';

interface ReceiptModalProps {
  order: OrderResponse;
  cart: CartItem[];
  member: Member | null;
  subtotal: number;
  memberDiscount: number;
  redeemDiscount: number;
  total: number;
  status: 'success' | 'pending';
  branchName?: string;
  cashierName?: string;
  onClose: () => void;
}

export default function ReceiptModal({
  order,
  cart,
  member,
  subtotal,
  memberDiscount,
  redeemDiscount,
  total,
  status,
  branchName,
  cashierName,
  onClose,
}: ReceiptModalProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const orderNumber = order.order_number ?? `#${order.id ?? '-'}`;
  const now = new Date().toLocaleString('id-ID');
  const isSuccess = status === 'success';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:bg-transparent print:static print:p-0">
      {/* CARD STRUK – hanya ini yang diprint */}
      <div
        id="thermal-receipt"
        className="
          bg-white rounded-2xl w-full max-w-xs mx-auto shadow-lg
          max-h-[90vh] overflow-y-auto
          print:max-h-none print:overflow-visible print:shadow-none print:rounded-none
        "
      >
        {/* Header – hanya tampil di layar, tidak ikut tercetak */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className={'rounded-full p-1.5 ' + (isSuccess ? 'bg-emerald-50' : 'bg-amber-50')}>
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {isSuccess ? 'Pembayaran Berhasil' : 'Pembayaran Tertunda'}
              </h2>
              <p className="text-[11px] text-gray-500">
                {isSuccess
                  ? 'Transaksi tercatat. Cetak struk bila diperlukan.'
                  : 'Status pending. Berikan struk sebagai bukti pemesanan.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 print:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi struk */}
        <div className="p-4 space-y-3 text-[11px] text-gray-800">
          {/* Info toko */}
          <div className="text-center">
            <h1 className="text-sm font-bold">Sinau Cafe</h1>
            <p className="text-[11px] text-gray-500">{branchName ?? 'Cabang tidak diketahui'}</p>
            <p className="text-[10px] text-gray-400">{now}</p>
          </div>

          {/* Order + kasir */}
          <div className="flex justify-between text-[11px] border-y border-dashed border-gray-300 py-1.5">
            <div>
              <p className="text-gray-500">No. Order</p>
              <p className="font-semibold">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Kasir</p>
              <p className="font-semibold">{cashierName ?? '-'}</p>
            </div>
          </div>

          {/* Member */}
          {member && (
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[11px]">
              <p className="font-semibold text-gray-800">{member.name}</p>
              <p className="text-gray-500">{member.phone}</p>
              <p className="mt-0.5 text-[10px] text-amber-700">
                Poin saat ini: <span className="font-semibold">{member.points}</span>
              </p>
              {redeemDiscount > 0 && (
                <p className="mt-0.5 text-[10px] text-blue-700">
                  100 poin ditukar untuk diskon Rp 30.000.
                </p>
              )}
            </div>
          )}

          {/* Item list */}
          <div className="space-y-1 border-y border-dashed border-gray-300 py-1.5">
            {cart.map((ci) => (
              <div key={ci.item.id} className="flex justify-between">
                <div className="mr-2">
                  <p className="font-medium">
                    {ci.item.name} x {ci.quantity}
                  </p>
                  {ci.notes && <p className="text-[10px] text-gray-500">Catatan: {ci.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(ci.item.price * ci.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan */}
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {memberDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon Member 10%</span>
                <span>-{formatPrice(memberDiscount)}</span>
              </div>
            )}
            {redeemDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Diskon Tukar 100 Poin</span>
                <span>-{formatPrice(redeemDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200">
              <span>Total</span>
              <span className="text-amber-700">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Tombol aksi – disembunyikan saat print */}
          <div className="flex gap-2 pt-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
