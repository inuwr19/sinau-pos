export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Item {
  category: string;
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  member_since: string;
  created_at: string;
}

export interface Order {
  id: string;
  branch_id: string;
  member_id: string | null;
  order_number: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string;
  item?: Item;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: 'cash' | 'card' | 'qris';
  amount: number;
  paid_at: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
  notes: string;
}
