// src/components/Cart.tsx
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  onUpdateItem: (itemId: string, quantity: number, notes?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  subtotal: number;
  memberDiscount: number;
  redeemDiscount: number;
  total: number;
}

export default function Cart({
  cart,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  subtotal,
  memberDiscount,
  redeemDiscount,
  total,
}: CartProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const totalDiscount = memberDiscount + redeemDiscount;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center space-x-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-amber-600" />
        <h2 className="font-semibold text-gray-800">Pesanan</h2>
        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
          {cart.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        {cart.map((cartItem) => (
          <div key={cartItem.item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm">{cartItem.item.name}</h3>
                <p className="text-xs text-gray-500">{formatPrice(cartItem.item.price)}</p>
              </div>
              <button
                onClick={() => onRemoveItem(cartItem.item.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateItem(cartItem.item.id, cartItem.quantity - 1)}
                  className="bg-gray-100 hover:bg-gray-200 p-1 rounded transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <span className="w-8 text-center font-medium text-sm">{cartItem.quantity}</span>
                <button
                  onClick={() => onUpdateItem(cartItem.item.id, cartItem.quantity + 1)}
                  className="bg-gray-100 hover:bg-gray-200 p-1 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <span className="font-semibold text-sm text-gray-800">
                {formatPrice(cartItem.item.price * cartItem.quantity)}
              </span>
            </div>

            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={cartItem.notes}
              onChange={(e) => onUpdateItem(cartItem.item.id, cartItem.quantity, e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        ))}

        {cart.length === 0 && (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Belum ada pesanan</p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
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

            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total Diskon</span>
                <span>-{formatPrice(totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Bayar Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
