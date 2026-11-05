<div align="center">

# 🎨 Doodaily Art

**Platform e-commerce gantungan kunci custom dengan kustomisasi 3D, coloring interaktif, dan chat langsung ke admin.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Mulai Cepat](#-mulai-cepat)
- [Skema Database](#️-skema-database)
- [Dokumentasi API](#-dokumentasi-api)
- [Alur Pengguna](#-alur-pengguna)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Proyek

**Doodaily Art** adalah aplikasi web toko online yang menjual gantungan kunci akrilik custom. Pelanggan dapat memilih produk jadi, mengustomisasi desain sendiri dengan preview 3D, mewarnai karakter secara interaktif, lalu memesan langsung melalui WhatsApp.

Admin memiliki dashboard untuk mengelola pesanan, mengunggah foto hasil jadi, dan membalas pesan pelanggan secara real-time.

> **Catatan branch:** branch `Fitur-Tanpa-AI` adalah versi tanpa fitur generasi gambar AI.

---

## ✨ Fitur Utama

### Untuk Pelanggan

| Fitur | Deskripsi |
|---|---|
| 🛍️ **Katalog Produk** | Jelajah produk dengan filter kategori dan pencarian |
| 🎨 **Kustomisasi 3D** | Pilih karakter, warna, dan teks dengan preview 3D real-time |
| 🖍️ **Coloring Interaktif** | Warnai karakter langsung di browser dengan canvas |
| 🛒 **Keranjang Persisten** | Keranjang tersimpan per akun (localStorage + sesi) |
| 💳 **Checkout Fleksibel** | QRIS, Transfer Bank, atau COD |
| 📦 **Riwayat Pesanan** | Lacak status pesanan & lihat foto hasil jadi |
| 💬 **Chat Admin** | Widget chat mengambang — tanya soal produk, keranjang, atau pesanan |

### Untuk Admin

| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard** | Statistik pesanan, pendapatan, dan pesanan terbaru |
| 📋 **Manajemen Pesanan** | Ubah status, unggah foto hasil, tambah catatan |
| 💬 **Pesan Masuk** | Panel chat dua kolom dengan filter konteks |
| 🔐 **Proteksi Rute** | Middleware membatasi `/admin/*` hanya untuk role admin |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
- [Next.js 16.3.5](https://nextjs.org) — App Router + Turbopack
- [React 19.2.8](https://react.dev)
- [TypeScript 5](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) — animasi
- [Lucide React](https://lucide.dev) — ikon

</td>
<td valign="top" width="50%">

**3D & Interaktif**
- [Three.js](https://threejs.org)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)

**Backend & Data**
- [Supabase](https://supabase.com) — PostgreSQL + REST API
- [NextAuth v5](https://authjs.dev) — autentikasi JWT
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — hashing password

</td>
</tr>
</table>

---

## 📁 Struktur Proyek

```
DooDaily/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # Session + Cart + Toast
│   │   ├── globals.css       # Design tokens
│   │   │
│   │   ├── shop/             # Katalog & detail produk
│   │   ├── customize/        # Kustomisasi keychain 3D
│   │   ├── coloring/         # Coloring interaktif
│   │   ├── playground/       # Playground desain
│   │   ├── community/        # Galeri komunitas
│   │   ├── about/ contact/ links/
│   │   │
│   │   ├── cart/             # Keranjang
│   │   ├── checkout/         # Checkout 3 langkah
│   │   ├── order-success/    # Halaman sukses
│   │   ├── my-orders/        # Riwayat pesanan user
│   │   │
│   │   ├── login/ register/  # Autentikasi
│   │   ├── chat/             # Chat layar penuh (user)
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx      # Dashboard statistik
│   │   │   ├── orders/       # Kelola pesanan
│   │   │   └── chat/         # Panel chat admin
│   │   │
│   │   └── api/
│   │       ├── auth/         # NextAuth handler
│   │       ├── chat/         # Endpoint chat
│   │       ├── orders/       # CRUD pesanan
│   │       ├── register/     # Registrasi user
│   │       └── seed/         # Seed admin awal
│   │
│   ├── components/
│   │   ├── layout/           # Navbar, Footer
│   │   ├── ui/               # Button, Toast, MusicPlayer
│   │   ├── chat/             # Widget, Composer, List, Hooks
│   │   ├── 3d/               # KeychainViewer3D
│   │   └── stickers/         # Dekorasi & animasi
│   │
│   └── lib/
│       ├── auth.ts           # Konfigurasi NextAuth
│       ├── supabase.ts       # Klien Supabase
│       ├── db.ts             # Queries: user, order, chat
│       ├── api-guard.ts      # Guard otorisasi API
│       ├── chat-access.ts    # Validasi kepemilikan thread
│       ├── chat-rate-limit.ts# Rate limiter in-memory
│       ├── chat-types.ts     # Tipe & konstanta chat
│       ├── cart-context.tsx  # State keranjang
│       └── products.ts       # Data katalog
│
├── public/                   # Aset statis (gambar, audio)
├── supabase-schema.sql       # Skema tabel users & orders
└── .env.example              # Template environment
```

> `src/proxy.ts` adalah middleware Next.js 16 yang memproteksi `/admin/*`.

---

## 🚀 Mulai Cepat

### Prasyarat

| Kebutuhan | Versi |
|---|---|
| Node.js | **≥ 20.9.0** (disarankan 22 LTS) |
| npm | ≥ 10 |
| Akun Supabase | Gratis |

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/firmannaibaho/DooDaily.git
cd DooDaily

# 2. Install dependencies
npm install

# 3. Salin template environment
cp .env.example .env.local
# → lalu isi nilainya sesuai contoh di dalam file

# 4. Siapkan database
#    Buka Supabase → SQL Editor → jalankan isi supabase-schema.sql

# 5. Jalankan development server
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)**

### Akun Admin

Admin pertama dibuat lewat endpoint `/api/seed` (hanya bisa dipakai selama belum ada
user ber-role `admin`), lalu masuk melalui halaman **`/login`**. Kredensial tidak
disimpan di dalam repositori.

### Perintah Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server (Turbopack, hot reload) |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npm run lint` | ESLint |

---

## 🔐 Variabel Environment

Konfigurasi dibaca dari `.env.local`. Daftar nama variabel yang dibutuhkan tersedia
di **[`.env.example`](./.env.example)** — file itulah satu-satunya acuan, karena
nilainya berbeda untuk setiap lingkungan.

| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key (aman di client, dibatasi RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Key server-only, **melewati RLS** |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Secret Auth.js, nilainya harus sama |

> ⚠️ File `.env*` sudah masuk `.gitignore`. Kredensial tidak pernah masuk repositori.

---

## 🗄️ Skema Database

Jalankan `supabase-schema.sql` di Supabase SQL Editor untuk tabel dasar:

| Tabel | Kolom Utama |
|---|---|
| **users** | `id`, `name`, `email`, `password` (bcrypt), `role`, `created_at` |
| **orders** | `id`, `order_id`, `user_id`, `customer_name`, `email`, `phone`, `address`, `city`, `notes`, `payment_method`, `items_json`, `subtotal`, `shipping`, `total`, `status`, `result_image`, `admin_notes`, `created_at` |

### Tabel Chat

Tabel `chat_threads` & `chat_messages` dibuat terpisah:

```sql
CREATE TABLE public.chat_threads (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'general' CHECK (kind IN ('general','cart','order')),
  order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
  subject TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_message_preview TEXT DEFAULT '',
  unread_for_admin INT NOT NULL DEFAULT 0,
  unread_for_user  INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chat_threads_context_chk CHECK (
    (kind = 'order' AND order_id IS NOT NULL) OR
    (kind = 'general' AND order_id IS NULL) OR (kind = 'cart')
  )
);

CREATE UNIQUE INDEX uq_chat_thread_general ON public.chat_threads (user_id)  WHERE kind = 'general';
CREATE UNIQUE INDEX uq_chat_thread_cart    ON public.chat_threads (user_id)  WHERE kind = 'cart';
CREATE UNIQUE INDEX uq_chat_thread_order   ON public.chat_threads (order_id) WHERE kind = 'order';

CREATE TABLE public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user','admin')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_chat_messages_thread ON public.chat_messages (thread_id, created_at);
CREATE INDEX idx_chat_threads_user    ON public.chat_threads (user_id, last_message_at DESC);
CREATE INDEX idx_chat_threads_last    ON public.chat_threads (last_message_at DESC);
```

---

## 📡 Dokumentasi API

### Autentikasi

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/callback/credentials` | Publik | Login |
| `GET` | `/api/auth/session` | Publik | Ambil sesi aktif |
| `POST` | `/api/register` | Publik | Registrasi user baru (role otomatis `user`) |
| `GET` | `/api/seed` | Publik | Seed admin pertama (sekali pakai) |

### Pesanan

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/orders` | Login | Admin → semua pesanan · User → miliknya sendiri |
| `POST` | `/api/orders` | Publik | Buat pesanan baru (guest diizinkan) |
| `PATCH` | `/api/orders/[order_id]` | **Admin** | Ubah status / foto hasil / catatan |
| `DELETE` | `/api/orders/[order_id]/delete` | **Admin** | Hapus pesanan |

### Chat

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/chat/threads` | Login | Daftar percakapan milik user |
| `GET` | `/api/chat/threads/[threadId]` | Pemilik | Riwayat pesan (+ `?after=<id>` untuk polling) |
| `POST` | `/api/chat/threads/[threadId]` | Pemilik | Kirim pesan |
| `PATCH` | `/api/chat/threads/[threadId]` | Pemilik | Tandai sudah dibaca |
| `POST` | `/api/chat/context` | Login | Buka percakapan `{kind, order_id}` |
| `GET` | `/api/chat/unread` | Login | Jumlah pesan belum dibaca |
| `GET` | `/api/chat/admin/threads` | **Admin** | Semua percakapan (filter `?kind=&status=`) |
| `GET` | `/api/chat/admin/threads/[threadId]` | **Admin** | Detail + pesan |
| `POST` | `/api/chat/admin/threads/[threadId]` | **Admin** | Balas sebagai admin |
| `PATCH` | `/api/chat/admin/threads/[threadId]` | **Admin** | Tandai dibaca / tutup percakapan |

**Kontrak respons:**

| Kondisi | Status |
|---|---|
| Belum login | `401` |
| Bukan admin | `403` |
| Body tidak valid | `400` |
| Percakapan ditutup | `409` |
| Terlalu cepat (rate limit) | `429` |

---

## 🔄 Alur Pengguna

```
┌──────────┐    ┌────────────┐    ┌───────────┐    ┌───────────┐
│  Jelajah │───▶│ Kustomisasi│───▶│ Keranjang │───▶│ Checkout  │
│  Produk  │    │ 3D/Coloring│    │           │    │ 3 langkah │
└──────────┘    └────────────┘    └───────────┘    └─────┬─────┘
                                                          │
                                    ┌─────────────────────┴────────────┐
                                    ▼                                  ▼
                            ┌───────────────┐                 ┌──────────────┐
                            │ Simpan ke DB  │                 │  WhatsApp    │
                            │ (tabel orders)│                 │  Konfirmasi  │
                            └───────┬───────┘                 └──────────────┘
                                    │
                                    ▼
                            ┌───────────────┐    ┌──────────────────┐
                            │ Riwayat       │───▶│ Chat per pesanan │
                            │ Pesanan Saya  │    │ (thread 'order') │
                            └───────────────┘    └──────────────────┘
```

### Model Chat

Satu sistem, tiga konteks percakapan:

| Konteks | Jumlah per User | Kegunaan |
|---|---|---|
| `general` | 1 | Obrolan umum dengan admin |
| `cart` | 1 | Tanya soal isi keranjang sebelum checkout |
| `order` | 1 per pesanan | Diskusi spesifik satu pesanan |

Pesan di-polling tiap **4 detik** saat panel terbuka, dan badge unread tiap **15 detik**.
Rate limit: **1 pesan / 2 detik** dan maksimal **30 pesan / menit**.

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Ikuti langkah berikut:

```bash
# 1. Fork & clone
git clone https://github.com/<username>/DooDaily.git

# 2. Buat branch fitur
git checkout -b fitur/nama-fitur

# 3. Commit perubahan
git commit -m "feat: deskripsi singkat fitur"

# 4. Push & buat Pull Request
git push origin fitur/nama-fitur
```

### Konvensi commit

| Prefix | Kegunaan |
|---|---|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `docs:` | Dokumentasi |
| `style:` | Formatting (tanpa ubah logika) |
| `refactor:` | Refaktor kode |
| `chore:` | Maintenance / build |

### Sebelum commit

```bash
npm run lint        # pastikan tidak ada error
npx tsc --noEmit    # pastikan type-check bersih
npm run build       # pastikan build produksi berhasil
```

---

## 📄 Lisensi

Proyek ini bersifat **privat** — © 2026 Doodaily Art. Seluruh hak dilindungi.

---

<div align="center">

**Dibuat dengan ❤️ dan sedikit sihir doodle**

[⬆ Kembali ke atas](#-doodaily-art)

</div>

