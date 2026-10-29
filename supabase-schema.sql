-- 1. TABEL USERS (Pengguna & Admin)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL ORDERS (Transaksi Pesanan)
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT DEFAULT '',
  payment_method TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC NOT NULL DEFAULT 10000,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_image TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. MATIKAN ROW LEVEL SECURITY (RLS) AGAR BACKEND NEXT.JS BISA BACA & TULIS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
