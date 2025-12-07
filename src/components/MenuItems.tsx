// src/components/MenuItems.tsx
import { Coffee, Plus } from 'lucide-react';
import { Item } from '../types';

interface MenuItemsProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
}

export default function MenuItems({ items, onAddToCart }: MenuItemsProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-amber-300"
          >
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
              ) : (
                <Coffee className="w-16 h-16 text-amber-600 opacity-50" />
              )}
            </div>

            <div className="p-3 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-600">{formatPrice(item.price)}</span>
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada item tersedia</p>
        </div>
      )}
    </div>
  );
}
