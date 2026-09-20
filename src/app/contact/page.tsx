"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Star, Sparkle } from "@/components/stickers/Decorations";
import { Instagram, Twitter, Facebook } from "@/components/stickers/SocialIcons";
import { Mail, MapPin, Clock } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-[80vh]">
      <div className="text-center mb-16 relative">
        <FloatingElement className="-top-8 left-1/3 hidden md:block">
          <Star className="text-brand-orange w-10 h-10" />
        </FloatingElement>
        <h1 className="font-display text-5xl md:text-6xl text-brand-blue mb-4">
          Say Hello!
        </h1>
        <p className="text-lg text-foreground/70 font-medium max-w-xl mx-auto">
          Got a question, a custom order request, or just want to chat about
          cute things? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]">
          <h2 className="font-display text-2xl text-brand-blue mb-6">
            Send Us a Message
          </h2>
          <form className="space-y-5">
            <div>
              <label className="text-sm font-bold text-foreground/70 mb-1 block">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Doodaily Fan"
                className="w-full h-12 px-5 rounded-full border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none font-medium bg-[#FFFBF2]"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground/70 mb-1 block">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full h-12 px-5 rounded-full border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none font-medium bg-[#FFFBF2]"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground/70 mb-1 block">
                Subject
              </label>
              <input
                type="text"
                placeholder="Custom Order / Question / Just Saying Hi"
                className="w-full h-12 px-5 rounded-full border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none font-medium bg-[#FFFBF2]"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground/70 mb-1 block">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Tell us what's on your mind..."
                className="w-full p-5 rounded-3xl border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none font-medium bg-[#FFFBF2] resize-none"
              ></textarea>
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full h-14">
              Send Message ✨
            </Button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-6">
          <div className="bg-brand-blue-light/30 rounded-[2.5rem] p-8 border-2 border-brand-blue-light flex items-start gap-5">
            <div className="w-14 h-14 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl text-brand-blue mb-1">Email Us</h3>
              <p className="text-foreground/70 font-medium">hello@doodaily.art</p>
              <p className="text-sm text-foreground/50 mt-1">
                We usually reply within 24 hours
              </p>
            </div>
          </div>

          <div className="bg-brand-orange-light/30 rounded-[2.5rem] p-8 border-2 border-brand-orange-light flex items-start gap-5">
            <div className="w-14 h-14 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl text-brand-orange mb-1">
                Working Hours
              </h3>
              <p className="text-foreground/70 font-medium">Mon – Sat, 09:00 – 17:00 WIB</p>
              <p className="text-sm text-foreground/50 mt-1">
                Sunday &amp; holidays: we&apos;re resting 😴
              </p>
            </div>
          </div>

          {/* Social Cards */}
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-brand-blue-light">
            <h3 className="font-display text-xl text-brand-blue mb-6">
              Come Doodle With Us
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFBF2] border-2 border-transparent hover:border-brand-blue transition-all group"
              >
                <Instagram className="w-6 h-6 text-brand-blue group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-sm text-foreground">Instagram</p>
                  <p className="text-xs text-foreground/50">{SOCIAL_LINKS.instagram.handle}</p>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFBF2] border-2 border-transparent hover:border-brand-blue transition-all group"
              >
                <span className="font-bold text-brand-blue text-lg group-hover:scale-110 transition-transform">TT</span>
                <div>
                  <p className="font-bold text-sm text-foreground">TikTok</p>
                  <p className="text-xs text-foreground/50">{SOCIAL_LINKS.tiktok.handle}</p>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFBF2] border-2 border-transparent hover:border-brand-blue transition-all group"
              >
                <Facebook className="w-6 h-6 text-brand-blue group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-sm text-foreground">Facebook</p>
                  <p className="text-xs text-foreground/50">{SOCIAL_LINKS.facebook.handle}</p>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.twitter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFBF2] border-2 border-transparent hover:border-brand-blue transition-all group"
              >
                <Twitter className="w-6 h-6 text-brand-blue group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-sm text-foreground">X</p>
                  <p className="text-xs text-foreground/50">{SOCIAL_LINKS.twitter.handle}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
