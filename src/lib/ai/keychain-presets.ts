/**
 * Doodaily — Preset gaya objek untuk keychain AI.
 *
 * KONSEP PENTING:
 * Benda gantungan kuncinya SELALU render realistis (dikunci di PRODUCT_BLOCK).
 * Yang bisa dipilih user hanyalah GAYA OBJEK/ILUSTRASI di dalam akrilik.
 *
 * Urutan tampilan: "realistis" dan "3d" lebih dulu, lalu preset lain.
 */

export interface ObjectPreset {
  id: string;
  label: string;
  emoji: string;
  /** Kata kunci gaya yang ditempel ke prompt. */
  style: string;
  /** Saran singkat untuk ditampilkan di UI. */
  hint: string;
}

/**
 * Blok produk — TIDAK bisa diubah user. Menjamin keychain tegak & realistis.
 *
 * RANTAI: "short silver keyring chain, ring directly above" dikunci eksplisit
 * karena tanpa arahan itu model sering menggambar rantai panjang menjuntai
 * atau ring melayang jauh di atas akrilik.
 *
 * Catatan: blok ini WAJIB ringkas. Anggaran total prompt hanya
 * MAX_PROMPT_LENGTH (640) char dikurangi negative list — blok ini tidak
 * boleh melebihi ~255 karakter.
 */
export const PRODUCT_BLOCK =
  "Front view product photo of a clear glossy acrylic keychain, upright and vertical, facing camera, centered, " +
  "3mm thick, polished edge, silver keyring chain on top, short chain, ring directly above the acrylic, " +
  "studio lighting, sharp focus, plain background";

/** Larangan tetap — orientasi, rantai pendek, & keychain tetap realistis. */
export const PRODUCT_NEGATIVE =
  "tilted, angled, rotated, leaning, lying flat, diagonal, skewed, perspective distortion, " +
  "long chain, dangling chain, oversized ring, floating ring, no keyring, watermark, text, deformed ring";


/** Preset gaya objek, urutan sesuai permintaan (realistis & 3d dulu). */
export const OBJECT_PRESETS: ObjectPreset[] = [
  {
    id: "realistis",
    label: "Realistis",
    emoji: "📷",
    style: "realistic photograph of the object, true-to-life materials, natural detail, high resolution",
    hint: "Objek terlihat seperti foto asli",
  },
  {
    id: "3d",
    label: "3D",
    emoji: "🧊",
    style: "3d rendered object, soft studio lighting, glossy PBR material, subtle ambient occlusion",
    hint: "Objek 3D halus dengan pencahayaan studio",
  },
  {
    id: "kawaii",
    label: "Kawaii",
    emoji: "🌸",
    style: "cute kawaii illustration, chibi, soft pastel colors, thick rounded outline",
    hint: "Imut, pastel, garis tebal",
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "✨",
    style: "anime illustration, clean lineart, cel shading, vibrant colors",
    hint: "Gaya anime dengan cel shading",
  },
  {
    id: "doodle",
    label: "Doodle",
    emoji: "✏️",
    style: "hand-drawn doodle, marker sketch, playful wobbly line art, simple colors",
    hint: "Sketsa tangan, garis playful",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    emoji: "🖌️",
    style: "watercolor painting, soft blended edges, visible paper texture, gentle wash",
    hint: "Cat air lembut",
  },
  {
    id: "pixel",
    label: "Pixel Art",
    emoji: "👾",
    style: "pixel art, 32-bit sprite, crisp square pixels, limited palette",
    hint: "Retro piksel",
  },
  {
    id: "sticker",
    label: "Sticker",
    emoji: "🏷️",
    style: "die-cut sticker artwork, bold white border outline, flat colors, clean shapes",
    hint: "Seperti stiker potong",
  },
];

export const DEFAULT_PRESET_ID = "realistis";

export function getPreset(id: string): ObjectPreset {
  return OBJECT_PRESETS.find((preset) => preset.id === id) ?? OBJECT_PRESETS[0];
}
