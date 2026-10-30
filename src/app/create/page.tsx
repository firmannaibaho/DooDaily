import type { Metadata } from "next";
import AiKeychainCustomizer from "./_components/AiKeychainCustomizer";

export const metadata: Metadata = {
  title: "Buat dengan AI",
  description:
    "Buat gantungan kunci akrilik custom dengan AI: tulis objeknya, pilih gayanya, dan gantungan kuncinya tetap tampil realistis.",
};

export default function CreatePage() {
  return <AiKeychainCustomizer />;
}
