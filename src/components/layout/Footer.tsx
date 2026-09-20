import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter } from "@/components/stickers/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/social";

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-brand-blue-light pt-16 pb-8 mt-20 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <Link href="/" className="relative w-[120px] h-[40px]">
              <Image
                src="/logo.jpg"
                alt="Doodaily Art"
                fill
                className="object-contain"
              />
            </Link>
            <p className="text-foreground/70 text-sm font-medium leading-relaxed max-w-xs">
              Welcome to the Doodaily Playground! Cute, unique, and customizable
              keychains and creative products.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-blue-light text-brand-blue rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-blue-light text-brand-blue rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-blue-light text-brand-blue rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-blue-light text-brand-blue rounded-full hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center font-bold text-xs"
                aria-label="TikTok"
              >
                TT
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-display text-xl text-brand-blue">Explore</h3>
            <ul className="flex flex-col gap-2 text-center md:text-left font-medium text-foreground/80">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Shop Keychains
                </Link>
              </li>
              <li>
                <Link
                  href="/customize"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Customize
                </Link>
              </li>
              <li>
                <Link
                  href="/coloring"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Coloring Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/playground"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-display text-xl text-brand-blue">About Us</h3>
            <ul className="flex flex-col gap-2 text-center md:text-left font-medium text-foreground/80">
              <li>
                <Link
                  href="/about"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/links"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Link Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-display text-xl text-brand-blue">Support</h3>
            <ul className="flex flex-col gap-2 text-center md:text-left font-medium text-foreground/80">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-orange hover:underline decoration-wavy"
                >
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t-2 border-brand-blue-light/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/60 text-sm font-medium">
            © {new Date().getFullYear()} Doodaily Art. All rights reserved.
          </p>
          <p className="text-foreground/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            Made with{" "}
            <span className="text-brand-orange text-lg">♥</span> and a
            little doodle magic
          </p>
        </div>
      </div>
    </footer>
  );
}
