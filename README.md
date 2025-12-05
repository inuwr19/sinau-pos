# Sinau Cafe - Point of Sales System

Sistem Point of Sales modern untuk Cafe Sinau dengan fitur lengkap untuk mengelola penjualan, menu, membership, dan pembayaran.

## Fitur Utama

### 1. Authentication & Multi-Branch
- Login dengan email dan password
- Setiap user terkait dengan cabang tertentu
- Otomatis menampilkan data sesuai cabang yang login

### 2. Menu Management
- Tampilan menu yang elegan dan mudah digunakan
- Filter berdasarkan kategori (Coffee, Non-Coffee, Food, Snack)
- Informasi lengkap: nama, deskripsi, harga
- Status ketersediaan produk

### 3. Order & Cart System
- Tambah item ke keranjang dengan mudah
- Ubah quantity secara dinamis
- Tambahkan catatan khusus untuk setiap item
- Review pesanan sebelum checkout
- Perhitungan otomatis subtotal dan total

### 4. Membership System
- Cari member dengan nomor telepon
- Registrasi member baru langsung dari POS
- Diskon otomatis 10% untuk member
- Sistem poin (1 poin per Rp 10.000 belanja)
- Tracking poin member

### 5. Payment Gateway
- Multiple payment methods:
  - **Tunai**: dengan perhitungan kembalian otomatis
  - **Kartu**: pembayaran kartu debit/kredit
  - **QRIS**: pembayaran digital
- Konfirmasi pembayaran yang jelas
- Generate nomor order otomatis
- Simpan riwayat transaksi lengkap

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup User untuk Login

**Penting**: Sebelum bisa login, Anda perlu membuat user melalui Supabase Dashboard.

#### Langkah-langkah:

1. Buka Supabase Dashboard: https://mcgdjnjxnnsrwjtmvdvh.supabase.co
2. Login ke project
3. Pergi ke **Authentication** > **Users**
4. Klik **Add User** > **Create new user**
5. Isi data user:
   - Email: `admin@sinaucafe.com`
   - Password: `password123`
   - Auto Confirm User: **Yes** ✓
6. Klik **Create user**

#### Tambahkan Branch ID ke User:

7. Setelah user dibuat, klik user tersebut
8. Pergi ke **SQL Editor** dan jalankan query:
   ```sql
   SELECT id, name FROM branches;
   ```
9. Copy salah satu `id` cabang
10. Kembali ke halaman user di **Authentication** > **Users**
11. Klik user yang baru dibuat
12. Scroll ke **Raw User Meta Data**
13. Klik **Edit** dan masukkan:
    ```json
    {
      "branch_id": "PASTE_ID_CABANG_DI_SINI"
    }
    ```
14. Klik **Save**

### 3. Run Development Server
```bash
npm run dev
```

### 4. Login
- Email: `admin@sinaucafe.com`
- Password: `password123`

## Data Default

Aplikasi sudah dilengkapi dengan data default:

### Cabang
- Sinau Cafe - Pusat (Jl. Sudirman No. 123, Jakarta)
- Sinau Cafe - Cabang Selatan (Jl. TB Simatupang No. 45, Jakarta)

### Kategori Menu
- Coffee
- Non-Coffee
- Food
- Snack

### Sample Menu (8 items)
- Espresso - Rp 25.000
- Cappuccino - Rp 35.000
- Latte - Rp 38.000
- Matcha Latte - Rp 40.000
- Chocolate - Rp 35.000
- Nasi Goreng Sinau - Rp 45.000
- Sandwich Club - Rp 42.000
- French Fries - Rp 25.000

### Sample Members (untuk testing)
- John Doe - 081234567890 (100 poin)
- Jane Smith - 081234567891 (250 poin)
- Ahmad Yusuf - 081234567892 (50 poin)

## Cara Menggunakan

### Membuat Pesanan

1. **Pilih Menu**: Klik kategori untuk filter, atau lihat semua menu
2. **Tambah ke Keranjang**: Klik tombol + pada item yang diinginkan
3. **Atur Quantity**: Gunakan tombol +/- di keranjang
4. **Tambah Catatan**: (Opsional) Tambahkan catatan khusus untuk item
5. **Pilih Member**: (Opsional) Cari member dengan nomor telepon untuk dapat diskon
6. **Checkout**: Klik "Bayar Sekarang"
7. **Pilih Metode Pembayaran**: Tunai, Kartu, atau QRIS
8. **Konfirmasi**: Klik "Konfirmasi Pembayaran"

### Menambah Member Baru

1. Di section Member, masukkan nomor telepon
2. Klik tombol search
3. Jika member belum terdaftar, form pendaftaran akan muncul
4. Isi nama, nomor telepon, dan email (opsional)
5. Klik "Simpan"
6. Member akan otomatis terpilih dan mendapat diskon 10%

### Sistem Poin

- Member mendapat 1 poin untuk setiap Rp 10.000 belanja
- Poin otomatis bertambah setiap transaksi
- Contoh: Belanja Rp 100.000 = dapat 10 poin

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite

## Database Schema

### Tables

- `branches` - Data cabang cafe
- `categories` - Kategori menu
- `items` - Menu/produk dengan harga dan detail
- `members` - Data membership dengan sistem poin
- `orders` - Pesanan dengan status dan total
- `order_items` - Detail item per pesanan
- `payments` - Riwayat pembayaran

### Security

- Row Level Security (RLS) enabled pada semua tabel
- Authentication required untuk semua operasi
- User hanya bisa akses data sesuai branch

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

## File Penting

- `SETUP.md` - Panduan setup lengkap
- `create-test-user.sql` - SQL helper untuk membuat test user
- `.env` - Environment variables (sudah configured)

## Troubleshooting

### Tidak bisa login
- Pastikan user sudah dibuat di Supabase Authentication
- Pastikan `branch_id` sudah ditambahkan ke user metadata
- Pastikan email dan password benar

### Menu tidak muncul
- Pastikan koneksi database berfungsi
- Check console browser untuk error
- Pastikan RLS policies sudah aktif

### Error saat checkout
- Pastikan user sudah authenticated
- Check apakah branch_id valid
- Pastikan cart tidak kosong

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development.

---

Dibuat dengan ❤️ untuk Sinau Cafe
