"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle, Star } from "@/components/stickers/Decorations";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock user creations
const CREATIONS = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  user: `@user_${i}`,
  likes: Math.floor(Math.random() * 500) + 50,
  height: i % 2 === 0 ? "h-64" : i % 3 === 0 ? "h-96" : "h-72",
  type: i % 4 === 0 ? "coloring" : "keychain"
}));

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-16 relative">
        <FloatingElement className="-top-8 left-1/4 hidden md:block">
           <Star className="text-brand-orange w-12 h-12" />
        </FloatingElement>
        <FloatingElement className="-top-4 right-1/4 hidden md:block" delay={0.5}>
           <Sparkle className="text-brand-blue w-10 h-10" />
        </FloatingElement>
        
        <h1 className="font-display text-5xl md:text-7xl text-brand-blue mb-4">Made by You</h1>
        <p className="text-xl text-foreground/70 font-medium max-w-2xl mx-auto mb-8">
          The Doodaily Community is so creative! Check out these amazing custom keychains and coloring masterpieces.
        </p>

        <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold">
          Share Your Doodaily
        </Button>
      </div>

      {/* Masonry Grid (Mocked with columns) */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
         {CREATIONS.map((creation) => (
           <div key={creation.id} className="break-inside-avoid relative group">
             
             <div className={cn(
               "w-full bg-[#FFFBF2] rounded-3xl border-2 border-brand-blue-light overflow-hidden relative flex flex-col p-4 sticker-shadow-hover transition-all duration-300",
               creation.height
             )}>
                <div className="absolute top-2 right-4 w-12 h-6 bg-[url('/tape.svg')] opacity-20 -rotate-6 z-20"></div>

                <div className="relative flex-grow flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                   <Image src="/logo.jpg" alt="User creation" fill className="object-contain p-8 drop-shadow-md" />
                </div>

                {/* Overlay Info on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 rounded-3xl">
                   <p className="text-white font-bold text-lg mb-2">{creation.user}</p>
                   <div className="flex gap-4">
                     <span className="flex items-center gap-1 text-white text-sm font-bold">
                       <Heart className="w-4 h-4 fill-white" /> {creation.likes}
                     </span>
                     <span className="flex items-center gap-1 text-white text-sm font-bold">
                       <MessageCircle className="w-4 h-4" /> {Math.floor(creation.likes / 10)}
                     </span>
                   </div>
                </div>
             </div>

           </div>
         ))}
      </div>

    </div>
  );
}
