import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Mode standalone menghasilkan server mandiri + node_modules minimal,
   * sehingga ukuran hasil build jauh lebih kecil dan proses start lebih cepat.
   */
  output: "standalone",

  /** Jangan tampilkan indikator dev di build produksi. */
  poweredByHeader: false,
};

export default nextConfig;
