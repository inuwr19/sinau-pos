-- Script untuk membuat test user untuk Sinau Cafe POS
-- Jalankan script ini di Supabase SQL Editor

-- 1. Lihat daftar cabang yang tersedia
SELECT
  id as branch_id,
  name as branch_name,
  address
FROM branches
WHERE is_active = true;

-- 2. Setelah memilih branch, copy ID-nya dan gunakan di langkah berikutnya
-- PENTING: Ganti 'PASTE_BRANCH_ID_HERE' dengan ID cabang yang dipilih

-- 3. User test akan dibuat melalui Supabase Auth Dashboard:
-- - Pergi ke Authentication > Users > Add User
-- - Email: admin@sinaucafe.com
-- - Password: password123
-- - Auto Confirm User: Yes
-- - Setelah dibuat, edit user dan tambahkan User Metadata:
--   {
--     "branch_id": "PASTE_BRANCH_ID_HERE"
--   }

-- ATAU gunakan Supabase Management API (jika ada akses)
-- Untuk saat ini, cara termudah adalah melalui Dashboard

-- 4. Verifikasi user sudah dibuat
-- Setelah user dibuat via dashboard, Anda bisa login dengan:
-- Email: admin@sinaucafe.com
-- Password: password123

-- 5. (Optional) Tambah sample members untuk testing
INSERT INTO members (name, phone, email, points) VALUES
  ('John Doe', '081234567890', 'john@example.com', 100),
  ('Jane Smith', '081234567891', 'jane@example.com', 250),
  ('Ahmad Yusuf', '081234567892', 'ahmad@example.com', 50)
ON CONFLICT (phone) DO NOTHING;

SELECT 'Test members berhasil ditambahkan!' as message;
