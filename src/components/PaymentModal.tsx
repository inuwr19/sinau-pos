import { useState } from 'react';
import { X, CreditCard, Wallet, QrCode, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CartItem, Member } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  cart: CartItem[];
  member: Member | null;
  subtotal: number;
  discount: number;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'qris';

export default function PaymentModal({
  cart,
  member,
  subtotal,
  discount,
  total,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { user, branch } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const change = cashAmount ? Math.max(0, parseFloat(cashAmount) - total) : 0;

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) {
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            branch_id: branch?.id,
            member_id: member?.id || null,
            order_number: orderNumber,
            subtotal,
            discount,
            total,
            status: 'completed',
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((ci) => ({
        order_id: order.id,
        item_id: ci.item.id,
        quantity: ci.quantity,
        price: ci.item.price,
        subtotal: ci.item.price * ci.quantity,
        notes: ci.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { error: paymentError } = await supabase.from('payments').insert([
        {
          order_id: order.id,
          payment_method: paymentMethod,
          amount: paymentMethod === 'cash' ? parseFloat(cashAmount) : total,
        },
      ]);

      if (paymentError) throw paymentError;

      if (member) {
        const earnedPoints = Math.floor(total / 10000);
        await supabase
          .from('members')
          .update({ points: member.points + earnedPoints })
          .eq('id', member.id);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'Tunai', icon: Wallet },
    { id: 'card' as PaymentMethod, name: 'Kartu', icon: CreditCard },
    { id: 'qris' as PaymentMethod, name: 'QRIS', icon: QrCode },
  ];

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pembayaran Berhasil!
          </h2>
          <p className="text-gray-600">Terima kasih atas transaksi Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Diskon Member</span>
                <span className="font-medium text-green-600">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-amber-600">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === method.id
                          ? 'text-amber-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-xs font-medium ${
                        paymentMethod === method.id
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {method.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Tunai
              </label>
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
                    <span className="font-bold text-green-600">
                      {formatPrice(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="bg-white p-4 inline-block rounded-lg mb-3">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Scan QR code untuk membayar
              </p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={
              loading ||
              (paymentMethod === 'cash' &&
                (!cashAmount || parseFloat(cashAmount) < total))
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
