"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Star, CatPaw } from "@/components/stickers/Decorations";
import { ShoppingBag, Heart, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { products, getProductBySlug } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug) || products[0]; // fallback
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0]?.options[0] || ""
  );
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      customizations: selectedVariant ? [`Design: ${selectedVariant}`] : [],
    }, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/50 mb-8">
        <Link href="/" className="hover:text-brand-blue">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-brand-blue">
          Shop
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Images */}
        <div className="relative sticky top-28">
          <div className="aspect-square bg-[#FFFBF2] rounded-[3rem] border-4 border-brand-blue-light flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute top-0 right-10 w-20 h-8 bg-[url('/tape.svg')] opacity-20 -rotate-6"></div>
            <div className="relative w-full h-full opacity-80 hover:scale-105 transition-transform duration-500">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex gap-2">
            {product.isNew && (
              <span className="bg-brand-orange-light text-brand-orange text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                New
              </span>
            )}
            {product.isPopular && (
              <span className="bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                Best Seller
              </span>
            )}
            {product.isCustomizable && (
              <span className="bg-brand-blue-light text-brand-blue text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                Customizable
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-brand-blue-light">
            <span className="font-display text-4xl text-brand-orange">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              <Star className="w-4 h-4 text-brand-orange" />
              <span className="text-sm font-bold text-foreground/80">
                4.9 (120 reviews)
              </span>
            </div>
          </div>

          <p className="text-foreground/70 font-medium text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="space-y-6 mb-10">
            {/* Variations */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-foreground">
                  Choose {product.variants[0].name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants[0].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariant(opt)}
                      className={cn(
                        "px-5 py-2.5 rounded-full border-2 font-bold flex items-center gap-2",
                        selectedVariant === opt
                          ? "border-brand-blue text-brand-blue bg-brand-blue-light"
                          : "border-brand-blue-light text-foreground/70 hover:border-brand-blue"
                      )}
                    >
                      {selectedVariant === opt && <Check className="w-4 h-4" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Quantity</h3>
              <div className="flex items-center">
                <div className="flex items-center bg-white border-2 border-brand-blue-light rounded-full p-1 w-32 justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-foreground font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-foreground font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <span className="ml-4 text-sm text-foreground/50 font-medium">
                  {product.stock} in stock
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button
              size="lg"
              className="flex-1 h-16 text-xl rounded-full gap-3 shadow-[0_6px_0_0_#2B4C7E] hover:shadow-[0_2px_0_0_#2B4C7E] hover:translate-y-[4px]"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-6 h-6" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full shrink-0 hidden sm:flex"
            >
              <Heart className="w-6 h-6" />
            </Button>
          </div>

          {/* Customizable CTA */}
          {product.isCustomizable && (
            <div className="bg-[#FFFBF2] rounded-3xl p-6 border-2 border-brand-orange border-dashed flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-orange-light flex items-center justify-center shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h4 className="font-bold text-brand-orange text-lg mb-1">
                  Want to make it unique?
                </h4>
                <p className="text-sm text-foreground/70 font-medium mb-3">
                  You can customize this character with your own colors and name.
                </p>
                <Link href="/customize">
                  <Button variant="secondary" size="sm" className="rounded-full">
                    Customize Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
