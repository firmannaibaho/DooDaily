"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Star, Sparkle } from "@/components/stickers/Decorations";
import { ShoppingBag, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { products, CATEGORIES, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addItem } = useCart();

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      customizations: [],
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="relative">
          <Star className="absolute -top-6 -left-6 text-brand-orange w-8 h-8 hidden md:block" />
          <h1 className="font-display text-5xl md:text-6xl text-brand-blue mb-4">
            The Doodaily Shop
          </h1>
          <p className="text-lg text-foreground/70 font-medium max-w-xl">
            Find your favorite cute companions. Every piece is designed to bring
            a little smile to your day.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search doodles..."
              className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-brand-blue-light focus:border-brand-blue outline-none font-medium bg-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-12 w-12 rounded-full border-2 border-brand-blue-light"
          >
            <SlidersHorizontal className="w-5 h-5 text-brand-blue" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-200 border-2 flex items-center gap-2",
              activeCategory === cat.id
                ? "bg-brand-blue text-white border-brand-blue shadow-[0_4px_0_0_#2B4C7E]"
                : "bg-white text-brand-blue border-brand-blue-light hover:border-brand-blue hover:bg-brand-blue-light"
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filtered.map((product) => (
          <Link
            href={`/shop/${product.slug}`}
            key={product.id}
            className="group flex flex-col"
          >
            <div className="relative bg-white rounded-[2.5rem] border-2 border-brand-blue-light p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 flex-grow flex flex-col">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm -rotate-6">
                    New!
                  </span>
                )}
                {product.isPopular && !product.isNew && (
                  <span className="bg-pink-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm rotate-3">
                    Popular
                  </span>
                )}
                {product.isCustomizable && (
                  <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm rotate-3 flex items-center gap-1">
                    <Sparkle className="w-3 h-3 text-white" /> Customizable
                  </span>
                )}
              </div>

              {/* Image Area */}
              <div className="aspect-square bg-[#FFFBF2] rounded-[1.5rem] mb-5 relative overflow-hidden flex items-center justify-center border border-brand-blue-light/50">
                <div className="w-3/4 h-3/4 opacity-60 relative group-hover:scale-110 transition-transform duration-500">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-foreground mb-2 leading-tight group-hover:text-brand-blue transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <p className="text-brand-orange font-display text-2xl tracking-wide">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-10 h-10 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors border border-transparent group-hover:border-[#2B4C7E] cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
