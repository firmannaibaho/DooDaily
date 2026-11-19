import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  /**
   * Mode standalone menghasilkan server mandiri + node_modules minimal,
   * sehingga ukuran hasil build jauh lebih kecil dan proses start lebih cepat.
   */
  output: "standalone",

  /** Jangan tampilkan indikator dev di build produksi. */
  poweredByHeader: false,

  /**
   * Gambar unggahan (testimoni, bukti bayar, referensi) disimpan di Supabase
   * Storage. Tanpa `remotePatterns` di bawah, `next/image` menolak
   * memuatnya dan gambar tampil kosong.
   */
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Cadangan bila NEXT_PUBLIC_SUPABASE_URL belum ada saat build.
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
