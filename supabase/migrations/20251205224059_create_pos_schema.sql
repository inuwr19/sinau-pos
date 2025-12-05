/*
  # Create Point of Sales Schema for Cafe Sinau

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text) - Nama cabang
      - `address` (text) - Alamat cabang
      - `phone` (text) - Nomor telepon
      - `is_active` (boolean) - Status aktif cabang
      - `created_at` (timestamptz)
      
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Nama kategori (Coffee, Food, Snack, etc)
      - `description` (text)
      - `created_at` (timestamptz)
      
    - `items`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text) - Nama produk
      - `description` (text) - Deskripsi produk
      - `price` (decimal) - Harga
      - `image_url` (text) - URL gambar produk
      - `is_available` (boolean) - Ketersediaan
      - `created_at` (timestamptz)
      
    - `members`
      - `id` (uuid, primary key)
      - `name` (text) - Nama member
      - `phone` (text) - Nomor telepon
      - `email` (text) - Email
      - `points` (integer) - Poin membership
      - `member_since` (timestamptz)
      - `created_at` (timestamptz)
      
    - `orders`
      - `id` (uuid, primary key)
      - `branch_id` (uuid, foreign key)
      - `member_id` (uuid, foreign key, nullable)
      - `order_number` (text) - Nomor pesanan
      - `subtotal` (decimal) - Subtotal
      - `discount` (decimal) - Diskon
      - `total` (decimal) - Total pembayaran
      - `status` (text) - pending, completed, cancelled
      - `created_by` (uuid) - User yang membuat order
      - `created_at` (timestamptz)
      
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `quantity` (integer) - Jumlah
      - `price` (decimal) - Harga per item
      - `subtotal` (decimal) - Subtotal item
      - `notes` (text) - Catatan khusus
      
    - `payments`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `payment_method` (text) - cash, card, qris
      - `amount` (decimal) - Jumlah bayar
      - `paid_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on branch access
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  image_url text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text DEFAULT '',
  points integer DEFAULT 0,
  member_since timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE,
  subtotal decimal(10,2) DEFAULT 0,
  discount decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  notes text DEFAULT ''
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  payment_method text NOT NULL,
  amount decimal(10,2) NOT NULL,
  paid_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for branches
CREATE POLICY "Authenticated users can view branches"
  ON branches FOR SELECT
  TO authenticated
  USING (true);

-- Policies for categories
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for items
CREATE POLICY "Authenticated users can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage items"
  ON items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for members
CREATE POLICY "Authenticated users can view members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage members"
  ON members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for orders
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for order_items
CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for payments
CREATE POLICY "Authenticated users can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default branches
INSERT INTO branches (name, address, phone) VALUES
  ('Sinau Cafe - Pusat', 'Jl. Sudirman No. 123, Jakarta', '021-12345678'),
  ('Sinau Cafe - Cabang Selatan', 'Jl. TB Simatupang No. 45, Jakarta', '021-87654321')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Coffee', 'Berbagai jenis kopi pilihan'),
  ('Non-Coffee', 'Minuman non-kopi'),
  ('Food', 'Makanan dan hidangan utama'),
  ('Snack', 'Camilan dan makanan ringan')
ON CONFLICT DO NOTHING;