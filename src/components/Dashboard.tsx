// src/components/Dashboard.tsx
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL, fetchJson } from '../lib/api';
import { CartItem, Category, Item, Member } from '../types';
import Cart from './Cart';
import MemberSearch from './MemberSearch';
import MenuItems from './MenuItems';
import PaymentModal from './PaymentModal';

export default function Dashboard() {
  const { branch, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, itemsData] = await Promise.all([
        fetchJson<Category[]>(`${API_URL}/categories`),
        fetchJson<Item[]>(`${API_URL}/menu?available=true`),
      ]);

      setCategories(categoriesData || []);
      setItems(itemsData || []);
    } catch (err) {
      console.error('Load data error', err);
      setCategories([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const addToCart = useCallback((item: Item) => {
    setCart((prev) => {
      const existingItem = prev.find((ci) => ci.item.id === item.id);
      if (existingItem) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1, notes: '' }];
    });
  }, []);

  const updateCartItem = useCallback((itemId: string, quantity: number, notes?: string) => {
    if (quantity === 0) {
      setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity, ...(notes !== undefined && { notes }) } : ci,
        ),
      );
    }
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedMember(null);
  }, []);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const filteredItems = useMemo(
    () =>
      selectedCategory === 'all'
        ? items
        : items.filter((item) => item.category_id === selectedCategory),
    [items, selectedCategory],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0),
    [cart],
  );

  const discount = useMemo(
    () => (selectedMember ? Math.floor(cartTotal * 0.1) : 0),
    [cartTotal, selectedMember],
  );

  const finalTotal = useMemo(() => cartTotal - discount, [cartTotal, discount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Sinau Cafe POS</h1>
                <p className="text-sm text-gray-500">{branch?.name}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <MenuItems items={filteredItems} onAddToCart={addToCart} />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-gray-800">Member</h2>
              </div>

              <MemberSearch selectedMember={selectedMember} onSelectMember={setSelectedMember} />

              {selectedMember && (
                <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{selectedMember.name}</p>
                      <p className="text-xs text-gray-500">{selectedMember.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Poin saat ini</p>
                      <p className="text-lg font-bold text-amber-600">
                        {selectedMember.points.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Cart
              cart={cart}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              subtotal={cartTotal}
              discount={discount}
              total={finalTotal}
            />
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          cart={cart}
          member={selectedMember}
          subtotal={cartTotal}
          discount={discount}
          total={finalTotal}
          onClose={() => setShowPayment(false)}
          onSuccess={clearCart}
        />
      )}
    </div>
  );
}
