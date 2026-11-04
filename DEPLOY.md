# Deploy ke DewaCloud (image-based)

Panduan singkat menjalankan Doodaily sebagai container Node.js.

## Image yang dipakai

```
node:22-bookworm-slim
```

| Alasan | Keterangan |
|---|---|
| Node 22 LTS | `next@16.3.5` mensyaratkan `node >= 20.9.0` |
| Debian 12 (glibc) | Kompatibel dengan `@next/swc-linux-x64-gnu` & `lightningcss-linux-x64-gnu` |
| `slim` | ±80 MB, tanpa tool yang tidak dipakai runtime |

> **Jangan pakai Alpine** (musl libc): rawan masalah pada modul native
> (mis. `sharp` bila nanti dipakai untuk kompres gambar AI).

## File terkait

| File | Fungsi |
|---|---|
| `Dockerfile` | 3 stage: deps → build → runner (non-root) |
| `.dockerignore` | Mengecualikan `node_modules`, `.next`, `.env*`, `docs`, `scripts` |
| `next.config.ts` | `output: "standalone"` → image jauh lebih kecil |

## Build & jalankan lokal

```bash
docker build -t doodaily .
docker run -p 3000:3000 --env-file .env.production doodaily
```

## Spesifikasi container minimum

| Resource | Minimum | Rekomendasi |
|---|---|---|
| vCPU | 1 | 2 |
| RAM (build) | 2 GB | 4 GB |
| RAM (runtime) | 512 MB | 1 GB |
| Disk | 5 GB | 10 GB |
| Port | 3000 | 3000 |

> Build Next.js bisa memakai 2–3 GB RAM sementara. Bila container hanya
> 1 GB, build akan gagal (`Killed`). Tambahkan swap atau build di luar.

## Environment variables

| Variable | Wajib | Catatan |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `3000` |
| `HOSTNAME` | ✅ | `0.0.0.0` — tanpa ini hanya listen localhost |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Ditanam saat **build** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Ditanam saat **build** |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only, melewati RLS |
| `NEXTAUTH_SECRET` | ✅ | Buat dengan `openssl rand -base64 32` |
| `AUTH_SECRET` | ✅ | Samakan dengan `NEXTAUTH_SECRET` |
| `IMAGE_API_BASE_URL` | ✅ | Endpoint gateway AI |
| `IMAGE_API_KEY` | ✅ | Server-only |

### Penting: variabel `NEXT_PUBLIC_*` ditanam saat build

Karena Next.js meng-*inline* variabel `NEXT_PUBLIC_*` ke bundle client,
nilainya harus tersedia **saat build**, bukan hanya saat runtime.
Dockerfile menerimanya sebagai `ARG`:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx \
  -t doodaily .
```

Pada platform yang membangun image otomatis, daftarkan keduanya sebagai
**build-time variables** (bukan hanya runtime environment).

## Verifikasi setelah deploy

```bash
curl https://domain-anda/            # 200
curl https://domain-anda/api/ai/status   # {"status":"online"}
```

Lalu uji manual:
1. Login sebagai user → kirim pesan chat → cek muncul di `/admin/chat`
2. Login admin (`admin@doodaily.com`) → balas → cek muncul di sisi user
3. Buka `/create` → generate gambar AI

## Catatan

- Timeout fungsi AI menunggu hingga 5 menit (retry rate limit). Pada
  container/VPS batas ini tidak berlaku, jadi fitur AI berjalan penuh.
- Rate limiter chat disimpan di memori proses. Untuk lebih dari satu
  instance, ganti dengan Redis (lihat `src/lib/chat-rate-limit.ts`).
