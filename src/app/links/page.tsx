import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Sparkle } from "@/components/stickers/Decorations";
import { Instagram, Twitter, Facebook } from "@/components/stickers/SocialIcons";
import { ShoppingBag, Paintbrush, Palette, Play, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/social";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
};

const LINKS = [
  { name: "Shop New Keychains!", href: "/shop", icon: ShoppingBag, type: "primary" },
  { name: "Customize Your Own", href: "/customize", icon: Paintbrush, type: "secondary" },
  { name: "Coloring Studio", href: "/coloring", icon: Palette, type: "outline" },
  { name: "Play in the Playground", href: "/playground", icon: Play, type: "outline" },
  { name: "Follow on Instagram", href: SOCIAL_LINKS.instagram.url, icon: Instagram, type: "social", external: true },
  { name: "Follow on TikTok", href: SOCIAL_LINKS.tiktok.url, icon: Play, type: "social", external: true },
  { name: "Follow on X", href: SOCIAL_LINKS.twitter.url, icon: Twitter, type: "social", external: true },
  { name: "Like on Facebook", href: SOCIAL_LINKS.facebook.url, icon: Facebook, type: "social", external: true },
  { name: "Contact Us", href: "/contact", icon: Mail, type: "outline" },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(#e0eaf5_2px,transparent_2px)] [background-size:24px_24px] flex flex-col items-center py-12 px-4 relative">
      {/* Decorations */}
      <Star className="absolute top-20 left-10 text-brand-orange w-12 h-12 opacity-50 rotate-12 animate-pulse" />
      <Sparkle className="absolute top-40 right-10 text-brand-blue w-10 h-10 opacity-50 -rotate-12 animate-pulse" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 border-4 border-white shadow-xl relative z-10">
        {/* Profile */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 bg-brand-blue-light rounded-full border-4 border-white shadow-md flex items-center justify-center p-4 relative mb-4">
            <Image src="/logo.jpg" alt="Doodaily Art" fill className="object-contain p-2" />
            <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white rotate-12">
              Cute!
            </div>
          </div>
          <h1 className="font-display text-3xl text-brand-blue mb-2">
            @doodailys.art
          </h1>
          <p className="text-foreground/70 font-medium text-center">
            Cute little things, made to be yours. ✨
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          {LINKS.map((link, i) => {
            const Icon = link.icon;

            let styleClass = "";
            if (link.type === "primary") {
              styleClass =
                "bg-brand-blue text-white hover:bg-[#3A649E] shadow-[0_4px_0_0_#2B4C7E] border-none";
            } else if (link.type === "secondary") {
              styleClass =
                "bg-brand-orange text-white hover:bg-[#E08F2A] shadow-[0_4px_0_0_#B8721B] border-none";
            } else if (link.type === "outline") {
              styleClass =
                "bg-white text-brand-blue border-2 border-brand-blue shadow-[0_4px_0_0_#4776B9] hover:bg-brand-blue-light";
            } else {
              styleClass =
                "bg-brand-blue-light/50 text-brand-blue border-2 border-brand-blue-light hover:border-brand-blue";
            }

            const isExternal = "external" in link && link.external;

            return isExternal ? (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-1 active:translate-y-1 active:shadow-none",
                  styleClass
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </a>
            ) : (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  "w-full h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-1 active:translate-y-1 active:shadow-none",
                  styleClass
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Image
            src="/logo.jpg"
            alt="Doodaily"
            width={80}
            height={30}
            className="mx-auto opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
