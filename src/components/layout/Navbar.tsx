"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Customize", href: "/customize" },
  { name: "Coloring", href: "/coloring" },
  { name: "Playground", href: "/playground" },
  { name: "Community", href: "/community" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFBF2]/90 backdrop-blur-md border-b-2 border-brand-blue-light">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="relative w-[140px] h-[48px]">
            <Image
              src="/logo.jpg"
              alt="Doodaily Art"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm border border-brand-blue-light">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-brand-blue text-white"
                    : "text-foreground hover:bg-brand-blue-light hover:text-brand-blue"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative group">
              <ShoppingBag className="w-6 h-6 text-brand-blue group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/customize">
            <Button>Create Yours</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden z-50">
          <Link href="/cart">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-brand-blue" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-brand-blue bg-brand-blue-light rounded-full"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] bg-[#FFFBF2] p-6 flex flex-col gap-4 border-t-2 border-brand-blue-light z-40">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-4 rounded-2xl text-lg font-bold transition-colors text-center border-2 border-transparent",
                    isActive
                      ? "bg-brand-blue text-white"
                      : "bg-white text-foreground hover:border-brand-blue"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <Link href="/customize" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-14 text-lg">Create Yours</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
