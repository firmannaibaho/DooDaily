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
  shipping NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_proof TEXT DEFAULT '',
  result_image TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL TESTIMONIALS (Ulasan Pembeli)
-- `image_path` menyimpan nama berkas GAMBAR TESTIMONI yang diunggah admin.
-- Berkasnya ada di public/testimoni/ (terpisah dari gambar shop di
-- public/catalog/). Tanpa kolom rating dan tanpa kota; `message` opsional
-- karena screenshot chat biasanya sudah memuat isi percakapannya.
CREATE TABLE IF NOT EXISTS public.testimonials (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_name TEXT DEFAULT '',
  message TEXT DEFAULT '',
  image_path TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS testimonials_published_idx
  ON public.testimonials (is_published, sort_order DESC, created_at DESC);

-- 4. MATIKAN ROW LEVEL SECURITY (RLS) AGAR BACKEND NEXT.JS BISA BACA & TULIS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;
