"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Star, Sparkle, CatPaw, DoodleArrow } from "@/components/stickers/Decorations";
import { Instagram, Twitter, Facebook } from "@/components/stickers/SocialIcons";
import { ShoppingBag } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { SOCIAL_LINKS } from "@/lib/social";

export default function Home() {
  const featured = getFeaturedProducts();
  const { addItem } = useCart();

  return (
    <div className="flex flex-col items-center w-full relative">
      {/* ======================== HERO ======================== */}
      <section className="w-full min-h-[85vh] relative flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Background Decorations */}
        <FloatingElement delay={0} className="top-1/4 left-[10%] md:left-[20%]">
          <Star className="w-10 h-10 md:w-16 md:h-16 text-brand-orange" />
        </FloatingElement>
        <FloatingElement delay={1} duration={5} rotation={15} className="bottom-1/4 left-[15%] md:left-[25%]">
          <CatPaw className="w-12 h-12 md:w-20 md:h-20 text-brand-blue opacity-50" />
        </FloatingElement>
        <FloatingElement delay={0.5} duration={3} className="top-1/3 right-[15%] md:right-[20%]">
          <Sparkle className="w-8 h-8 md:w-14 md:h-14 text-brand-blue" />
        </FloatingElement>
        <FloatingElement delay={1.5} duration={4.5} rotation={-10} className="bottom-1/3 right-[10%] md:right-[25%]">
          <Star className="w-12 h-12 md:w-20 md:h-20 text-brand-orange opacity-40" />
        </FloatingElement>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <div className="relative inline-block mb-4">
            <span className="absolute -top-6 -left-8 md:-left-12 rotate-[-20deg]">
              <Sparkle className="w-8 h-8 text-brand-orange" />
            </span>
            <span className="inline-block bg-white px-6 py-2 rounded-full border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] font-bold text-brand-blue text-sm md:text-base tracking-wide uppercase">
              The Doodaily Universe
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-brand-blue leading-[1.1] tracking-tight">
            Welcome to the <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-orange">Doodaily</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-3 md:h-5 bg-brand-orange-light -z-10 rounded-full transform -rotate-1"></span>
            </span>{" "}
            Playground!
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 font-medium max-w-2xl mt-4">
            Cute little things, made to be yours. Explore our world of
            customizable keychains, stickers, and doodles.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-4">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto text-xl h-16 px-10 rounded-full">
                Shop Keychains
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute -top-12 -right-12 hidden sm:block animate-bounce">
                <DoodleArrow className="rotate-[110deg] w-12 h-12 text-brand-orange" />
              </div>
              <Link href="/customize">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xl h-16 px-10 rounded-full">
                  Create Your Own
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-brand-blue flex justify-center p-2">
            <div className="w-1.5 h-3 bg-brand-orange rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ======================== MEET THE WORLD ======================== */}
      <section className="w-full py-24 bg-brand-blue-light/30 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 relative">
            <h2 className="font-display text-4xl md:text-5xl text-brand-blue mb-4">
              Little doodles.
              <br />
              Big personality.
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl mx-auto">
              Every piece is designed to bring a little smile to your daily
              routine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              { title: "Cute", desc: "Soft shapes, happy faces, and colors that pop.", icon: <Star className="w-10 h-10 text-brand-orange" />, bg: "bg-brand-orange-light", rot: "" },
              { title: "Unique", desc: "Original illustrations you won't find anywhere else.", icon: <Sparkle className="w-10 h-10 text-brand-blue" />, bg: "bg-brand-blue-light", rot: "rotate-1 hover:rotate-0" },
              { title: "Customizable", desc: "Make it yours with colors, charms, and names.", icon: <CatPaw className="w-10 h-10 text-green-500" />, bg: "bg-green-100", rot: "-rotate-1 hover:rotate-0" },
              { title: "Affordable", desc: "Creative accessories that fit student budgets.", icon: <span className="text-3xl">✨</span>, bg: "bg-yellow-100", rot: "" },
            ].map((card) => (
              <div
                key={card.title}
                className={`bg-white rounded-3xl p-8 border-2 border-brand-blue-light hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 hover:border-brand-blue transition-all group flex flex-col items-center text-center ${card.rot}`}
              >
                <div className={`w-20 h-20 ${card.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-display text-2xl text-brand-blue mb-2">{card.title}</h3>
                <p className="text-foreground/70 font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURED PRODUCTS ======================== */}
      <section className="w-full py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-brand-blue flex items-center gap-4">
              Collect Your Favorites
              <Sparkle className="w-8 h-8 text-brand-orange" />
            </h2>
            <Link href="/shop" className="hidden md:flex">
              <Button variant="outline" className="rounded-full">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((product) => (
              <Link href={`/shop/${product.slug}`} key={product.id}>
                <div className="group relative bg-white rounded-[2rem] border-2 border-brand-blue-light p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                  {product.isNew && (
                    <div className="absolute -top-3 -right-3 z-10 rotate-12 group-hover:rotate-6 transition-transform">
                      <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                        New!
                      </span>
                    </div>
                  )}
                  <div className="aspect-square bg-[#FFFBF2] rounded-[1.5rem] mb-4 relative overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full opacity-60 p-4 group-hover:scale-110 transition-transform duration-500">
                      <Image src={product.images[0]} alt={product.name} fill className="object-contain drop-shadow-md" />
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-bold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-brand-orange font-bold text-xl mb-4">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <div className="mt-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({ productId: product.id, name: product.name, price: product.price, image: product.images[0], customizations: [] });
                        }}
                        className="w-full py-3 rounded-full bg-brand-blue text-white font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-[#3A649E]"
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <Link href="/shop">
              <Button variant="outline" className="rounded-full">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== CTA: CREATIVE ======================== */}
      <section className="w-full max-w-5xl mx-auto px-4 py-10 mb-10">
        <div className="bg-brand-orange rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center justify-between gap-12 border-4 border-white">
          <div className="relative z-10 max-w-lg text-center md:text-left">
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              Unleash your creativity!
            </h2>
            <p className="text-white/90 text-lg md:text-xl font-medium mb-8">
              Jump into the Coloring Studio or the Doodaily Playground to make
              your own masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/coloring">
                <Button className="bg-white text-brand-orange hover:bg-[#FFFBF2] shadow-none hover:translate-y-0 text-lg h-14 px-8 rounded-full border-2 border-transparent hover:border-white">
                  Coloring Studio
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" className="border-white text-white hover:bg-white/20 shadow-none hover:translate-y-0 text-lg h-14 px-8 rounded-full">
                  Playground
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-white/20 rounded-full flex items-center justify-center p-8 backdrop-blur-sm border-4 border-white/30">
            <Image src="/logo.jpg" alt="Doodaily Logo" width={200} height={200} className="object-contain" />
          </div>

          <Star className="absolute top-10 right-10 w-12 h-12 text-white opacity-50" />
          <Star className="absolute bottom-10 left-10 w-8 h-8 text-white opacity-50" />
        </div>
      </section>

      {/* ======================== SOCIAL MEDIA ======================== */}
      <section className="w-full py-20 bg-brand-blue-light/20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-brand-blue mb-4">
            Come Doodle With Us
          </h2>
          <p className="text-lg text-foreground/70 font-medium max-w-xl mx-auto mb-12">
            Follow us for daily doodles, giveaways, and behind-the-scenes peeks!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all flex flex-col items-center gap-3 group"
            >
              <Instagram className="w-10 h-10 text-brand-blue group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-foreground">Instagram</span>
              <span className="text-xs text-foreground/50">{SOCIAL_LINKS.instagram.handle}</span>
            </a>
            <a
              href={SOCIAL_LINKS.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all flex flex-col items-center gap-3 group"
            >
              <span className="text-3xl font-bold text-brand-blue group-hover:scale-110 transition-transform">TT</span>
              <span className="font-bold text-sm text-foreground">TikTok</span>
              <span className="text-xs text-foreground/50">{SOCIAL_LINKS.tiktok.handle}</span>
            </a>
            <a
              href={SOCIAL_LINKS.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all flex flex-col items-center gap-3 group"
            >
              <Facebook className="w-10 h-10 text-brand-blue group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-foreground">Facebook</span>
              <span className="text-xs text-foreground/50">{SOCIAL_LINKS.facebook.handle}</span>
            </a>
            <a
              href={SOCIAL_LINKS.twitter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all flex flex-col items-center gap-3 group"
            >
              <Twitter className="w-10 h-10 text-brand-blue group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-foreground">X</span>
              <span className="text-xs text-foreground/50">{SOCIAL_LINKS.twitter.handle}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
