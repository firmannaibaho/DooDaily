import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Mode standalone menghasilkan server mandiri + node_modules minimal
   * sehingga image Docker jauh lebih kecil (≈150 MB vs ≈1 GB).
   * Dipakai oleh deploy container (DewaCloud).
   */
  output: "standalone",

  /** Jangan tampilkan indikator dev di build produksi. */
  poweredByHeader: false,
};

export default nextConfig;
