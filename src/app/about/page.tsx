"use client";

import React from "react";
import Image from "next/image";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Star, Sparkle, CatPaw, DoodleArrow } from "@/components/stickers/Decorations";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-16 relative">
        <FloatingElement className="-top-12 right-0 md:right-1/4 hidden md:block">
           <DoodleArrow className="text-brand-orange w-16 h-16 rotate-45" />
        </FloatingElement>
        <h1 className="font-display text-5xl md:text-7xl text-brand-blue mb-6">Hello! We are Doodaily.</h1>
        <p className="text-xl md:text-2xl text-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
          A tiny studio making cute things to brighten your daily routine.
        </p>
      </div>

      {/* Main Image */}
      <div className="w-full aspect-[21/9] bg-[#FFFBF2] rounded-[3rem] border-4 border-brand-blue-light relative overflow-hidden mb-16 sticker-shadow flex items-center justify-center p-8">
         <div className="absolute top-0 right-10 w-24 h-10 bg-[url('/tape.svg')] opacity-30 -rotate-6 z-20"></div>
         <div className="absolute bottom-10 left-10 w-24 h-10 bg-[url('/tape.svg')] opacity-30 rotate-12 z-20"></div>
         
         <div className="relative w-full max-w-md h-full opacity-80">
            <Image src="/logo.jpg" alt="Doodaily Studio" fill className="object-contain drop-shadow-xl" />
         </div>
      </div>

      {/* Content */}
      <div className="prose prose-lg md:prose-xl mx-auto prose-headings:font-display prose-headings:text-brand-blue prose-p:text-foreground/80 prose-p:font-medium prose-p:leading-relaxed">
         
         <div className="relative">
           <FloatingElement className="-left-16 top-0 hidden md:block"><Star className="w-8 h-8 text-brand-orange" /></FloatingElement>
           
           <h2 className="text-4xl mb-6">Our Story</h2>
           <p className="mb-8">
             Doodaily Art started from a simple love for doodles and a desire to make everyday items a little more fun. 
             We believe that creativity shouldn't be expensive, and everyone deserves a little companion to bring a smile to their day.
           </p>

           <h2 className="text-4xl mb-6 mt-12">Made for You</h2>
           <p className="mb-8">
             Whether you're a student looking to decorate your backpack, or just someone who appreciates cute design, 
             our products are made with you in mind. We specifically focus on customizable keychains because we want you 
             to feel a connection with the things you own.
           </p>

           <div className="bg-brand-blue-light/50 p-8 rounded-[2rem] border-2 border-brand-blue-light my-12 relative">
             <FloatingElement className="-top-6 -right-6"><CatPaw className="w-12 h-12 text-brand-blue" /></FloatingElement>
             <h3 className="font-display text-2xl text-brand-blue mb-4">Our Mission</h3>
             <p className="text-foreground/80 m-0 text-lg">
               To create a playful sticker world where art is affordable, customizable, and always cute.
             </p>
           </div>
         </div>

      </div>

    </div>
  );
}
