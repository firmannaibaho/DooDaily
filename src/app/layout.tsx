import type { Metadata } from "next";
import { Quicksand, Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Doodaily Art — Cute, Custom & Creative",
    template: "%s | Doodaily Art",
  },
  description:
    "Discover cute, unique and customizable keychains and creative products from Doodaily Art.",
  openGraph: {
    title: "Doodaily Art — Cute, Custom & Creative",
    description:
      "Discover cute, unique and customizable keychains and creative products from Doodaily Art.",
    siteName: "Doodaily Art",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doodaily Art — Cute, Custom & Creative",
    description:
      "Discover cute, unique and customizable keychains and creative products from Doodaily Art.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${fredoka.variable} antialiased min-h-screen flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
