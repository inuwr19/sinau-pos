// src/components/Dashboard.tsx
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL, fetchJson } from '../lib/api';
import { CartItem, Category, Item, Member } from '../types';
import Cart from './Cart';
import MemberSearch from './MemberSearch';
import MenuItems from './MenuItems';
import PaymentModal, { OrderResponse } from './PaymentModal';
import ReceiptModal from './ReceiptModal';

type ReceiptStatus = 'success' | 'pending';

type ReceiptData = {
  order: OrderResponse;
  cart: CartItem[];
  member: Member | null;
  subtotal: number;
  memberDiscount: number;
  redeemDiscount: number;
  total: number;
  status: ReceiptStatus;
};

export default function Dashboard() {
  const { user, branch, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  // state untuk diskon
  const [useMemberDiscount, setUseMemberDiscount] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState(false);

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
          ci.item.id === itemId
            ? {
                ...ci,
                quantity,
                ...(notes !== undefined && { notes }),
              }
            : ci,
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
    setRedeemPoints(false);
    setUseMemberDiscount(true);
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

  // Diskon member 10% – hanya jika:
  // - ada member
  // - toggle useMemberDiscount aktif
  // - TIDAK sedang tukar poin
  const memberDiscount = useMemo(() => {
    if (!selectedMember) return 0;
    if (!useMemberDiscount) return 0;
    if (redeemPoints) return 0; // tidak dapat 10% jika tukar poin
    return Math.floor(cartTotal * 0.1);
  }, [selectedMember, useMemberDiscount, redeemPoints, cartTotal]);

  // Diskon tukar poin Rp 30.000 – hanya jika poin >= 100 dan total >= 30.000
  const redeemDiscount = useMemo(() => {
    if (!selectedMember || !redeemPoints) return 0;
    if (selectedMember.points < 100) return 0;

    // total sebelum diskon poin (boleh pakai total kotor)
    if (cartTotal < 30000) return 0;

    return 30000;
  }, [selectedMember, redeemPoints, cartTotal]);

  const discountTotal = useMemo(
    () => memberDiscount + redeemDiscount,
    [memberDiscount, redeemDiscount],
  );

  const finalTotal = useMemo(() => cartTotal - discountTotal, [cartTotal, discountTotal]);

  const canRedeem = !!selectedMember && selectedMember.points >= 100 && cartTotal >= 30000;

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

              <MemberSearch
                selectedMember={selectedMember}
                onSelectMember={(m) => {
                  setSelectedMember(m);
                  setRedeemPoints(false);
                  setUseMemberDiscount(true);
                }}
              />

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

                  {/* Toggle diskon member 10% */}
                  <div className="mt-3 border-t border-amber-100 pt-2">
                    <label className="flex items-start gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={useMemberDiscount}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUseMemberDiscount(checked);
                          // Jika diskon member diaktifkan, matikan redeem poin
                          if (checked && redeemPoints) {
                            setRedeemPoints(false);
                          }
                        }}
                      />
                      <span>
                        Aktifkan <span className="font-semibold">Diskon Member 10%</span> untuk
                        transaksi ini.
                      </span>
                    </label>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Diskon 10% tidak bisa digabung dengan tukar poin.
                    </p>
                  </div>

                  {/* Toggle tukar poin 100 poin */}
                  <div className="mt-3 border-t border-amber-100 pt-2">
                    <label className="flex items-start gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={redeemPoints}
                        disabled={!canRedeem}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRedeemPoints(checked);
                          // Jika tukar poin diaktifkan, matikan diskon member
                          if (checked) {
                            setUseMemberDiscount(false);
                          }
                        }}
                      />
                      <span>
                        Gunakan <span className="font-semibold">100 poin</span> untuk diskon{' '}
                        <span className="font-semibold text-amber-600">Rp 30.000</span> pada
                        transaksi ini.
                      </span>
                    </label>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Minimal total belanja Rp 30.000 dan poin &ge; 100. Tidak bisa digabung dengan
                      diskon 10%.
                    </p>
                    {!canRedeem && (
                      <p className="mt-1 text-[11px] text-red-500">
                        Poin atau total transaksi belum memenuhi syarat tukar poin.
                      </p>
                    )}
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
              memberDiscount={memberDiscount}
              redeemDiscount={redeemDiscount}
              total={finalTotal}
            />
          </div>
        </div>
      </div>

      {/* Modal payment */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          member={selectedMember}
          subtotal={cartTotal}
          memberDiscount={memberDiscount}
          redeemDiscount={redeemDiscount}
          total={finalTotal}
          redeemPoints={redeemPoints}
          onClose={() => setShowPayment(false)}
          onSuccess={(order, status) => {
            const cartSnapshot = [...cart];
            const memberSnapshot = selectedMember;

            setReceiptData({
              order,
              cart: cartSnapshot,
              member: memberSnapshot,
              subtotal: cartTotal,
              memberDiscount,
              redeemDiscount,
              total: finalTotal,
              status,
            });

            clearCart();
            setShowPayment(false);
          }}
        />
      )}

      {/* Modal struk */}
      {receiptData && (
        <ReceiptModal
          order={receiptData.order}
          cart={receiptData.cart}
          member={receiptData.member}
          subtotal={receiptData.subtotal}
          memberDiscount={receiptData.memberDiscount}
          redeemDiscount={receiptData.redeemDiscount}
          total={receiptData.total}
          status={receiptData.status}
          branchName={branch?.name}
          cashierName={user?.name ?? user?.email ?? undefined}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
