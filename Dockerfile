# ═══════════════════════════════════════════════════════════════════
# Dockerfile — Doodaily (Next.js 16, standalone)
#
# Base image: node:22-bookworm-slim
#   - Node 22 LTS (next 16.3.5 butuh >=20.9.0)
#   - Debian 12 (glibc) — kompatibel dengan @next/swc & lightningcss
#   - slim: ±80 MB, tanpa tool yang tidak perlu
#
# Build:  docker build -t doodaily .
# Run  :  docker run -p 3000:3000 --env-file .env.production doodaily
# ═══════════════════════════════════════════════════════════════════

# ── Stage 1: dependencies ──────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# `npm ci` butuh lockfile; keduanya wajib ada di build context.
COPY package.json package-lock.json ./

# --include=dev karena build Next butuh typescript & tailwind
RUN npm ci --include=dev

# ── Stage 2: build ─────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variabel NEXT_PUBLIC_* harus ada SAAT BUILD karena ditanam ke bundle client.
# Nilai sebenarnya di-inject oleh platform (DewaCloud) sebagai build args.
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# ── Stage 3: runtime ───────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Wajib 0.0.0.0 agar bisa diakses dari luar container.
ENV HOSTNAME=0.0.0.0

# Jalankan sebagai non-root.
RUN groupadd -g 1001 nodejs \
 && useradd -u 1001 -g nodejs -m nextjs

# Aset statis & hasil build standalone.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
