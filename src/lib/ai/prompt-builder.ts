import { PRODUCT_BLOCK, PRODUCT_NEGATIVE, getPreset, type ObjectPreset } from "./keychain-presets";

/**
 * Perakit prompt untuk keychain AI.
 *
 * Struktur:
 *   [PRODUK realistis & tegak] + [GAYA objek] + [DESKRIPSI user] + [larangan]
 *
 * Catatan penting: total prompt dijaga ringkas (<= ~520 karakter) karena
 * upstream membalas HTTP 502 untuk prompt yang terlalu panjang.
 */

export const MAX_DESCRIPTION_LENGTH = 180;
/**
 * Batas panjang prompt total. Diuji empiris: 817 char → upstream balas 502,
 * ~550 char → sukses. Dipakai 640 sebagai batas aman (dengan margin).
 */
export const MAX_PROMPT_LENGTH = 640;

export interface BuildPromptInput {
  description: string;
  presetId: string;
}

export interface BuildPromptResult {
  prompt: string;
  preset: ObjectPreset;
  /** true bila prompt dipangkas agar muat. */
  truncated: boolean;
}

/** Rapikan deskripsi: buang spasi ganda & karakter aneh. */
export function sanitizeDescription(input: string): string {
  return input
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);
}

const KEYCHAIN_ANCHOR = "keychain stays photorealistic";

/** Susun prompt dari bagian-bagian tetap + deskripsi objek. */
function compose(subject: string, presetStyle: string): string {
  return [
    PRODUCT_BLOCK,
    `object inside: ${subject}`,
    presetStyle,
    KEYCHAIN_ANCHOR,
    `avoid: ${PRODUCT_NEGATIVE}`,
  ].join(". ");
}

export function buildKeychainPrompt({ description, presetId }: BuildPromptInput): BuildPromptResult {
  const preset = getPreset(presetId);
  let subject = sanitizeDescription(description);
  let truncated = false;

  // Hitung presisi: panjang prompt tanpa deskripsi.
  const baseLength = compose("", preset.style).length;

  if (baseLength + subject.length > MAX_PROMPT_LENGTH) {
    truncated = true;
    const budget = MAX_PROMPT_LENGTH - baseLength;
    // Utamakan tetap di bawah MAX_PROMPT_LENGTH (prompt kepanjangan → 502).
    // Batas minimum 24 hanya dipakai bila budget memang masih memungkinkan.
    const allowed = budget >= 24 ? budget : Math.max(0, budget);
    subject = subject.slice(0, allowed).trim();
  }

  return { prompt: compose(subject, preset.style), preset, truncated };
}
