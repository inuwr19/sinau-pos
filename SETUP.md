# Sinau Cafe - Point of Sales Setup Guide

## Cara Membuat User untuk Login

Untuk membuat user pertama kali, Anda perlu menggunakan Supabase Authentication. Berikut langkah-langkahnya:

### Opsi 1: Melalui Supabase Dashboard

1. Buka [Supabase Dashboard](https://mcgdjnjxnnsrwjtmvdvh.supabase.co)
2. Login ke project Anda
3. Pergi ke **Authentication** > **Users**
4. Klik **Add User** > **Create new user**
5. Masukkan:
   - Email: `admin@sinaucafe.com`
   - Password: `password123`
   - Auto Confirm User: **Yes**
6. Setelah user dibuat, klik user tersebut
7. Scroll ke **User Metadata** section
8. Tambahkan metadata dengan klik **Edit**
9. Tambahkan field baru:
   ```json
   {
     "branch_id": "PASTE_BRANCH_ID_HERE"
   }
   ```

### Mendapatkan Branch ID

Untuk mendapatkan Branch ID, jalankan query berikut di **SQL Editor**:

```sql
SELECT id, name FROM branches;
```

Copy salah satu ID cabang dan paste ke user metadata di atas.

### Opsi 2: Menggunakan SQL (Recommended untuk Testing)

Jalankan script berikut di **SQL Editor** Supabase:

```sql
-- Get branch IDs
SELECT id, name FROM branches;

-- Setelah mendapat branch ID, gunakan script berikut untuk membuat user
-- Ganti 'YOUR_BRANCH_ID' dengan ID cabang yang Anda pilih
```

### Login Credentials Default (Setelah Setup)

- **Email**: admin@sinaucafe.com
- **Password**: password123
- **Branch**: Pilih salah satu cabang yang tersedia

## Fitur Aplikasi

### 1. Authentication
- Login dengan email dan password
- User terkait dengan cabang tertentu
- Logout

### 2. Menu Management
- Tampilan menu berdasarkan kategori (Coffee, Non-Coffee, Food, Snack)
- Filter menu berdasarkan kategori
- Harga dan deskripsi setiap item

### 3. Order Management
- Tambah item ke keranjang
- Ubah quantity item
- Tambahkan catatan khusus untuk item
- Hapus item dari keranjang
- Review pesanan sebelum checkout

### 4. Member Management
- Cari member berdasarkan nomor telepon
- Daftarkan member baru
- Member mendapat diskon 10% otomatis
- Member mendapat poin setiap transaksi (1 poin per Rp 10.000)

### 5. Payment
- Multiple payment methods:
  - Tunai (dengan perhitungan kembalian)
  - Kartu
  - QRIS
- Konfirmasi pembayaran
- Generate nomor order otomatis
- Simpan riwayat transaksi

## Database Schema

Aplikasi menggunakan Supabase dengan schema:

- **branches**: Data cabang cafe
- **categories**: Kategori menu
- **items**: Menu/produk
- **members**: Data membership
- **orders**: Pesanan
- **order_items**: Detail item per pesanan
- **payments**: Data pembayaran

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Default Data

Aplikasi sudah dilengkapi dengan:
- 2 cabang (Pusat dan Selatan)
- 4 kategori menu
- 8 sample menu items

Anda bisa menambahkan data lebih banyak melalui Supabase Dashboard atau SQL Editor.
