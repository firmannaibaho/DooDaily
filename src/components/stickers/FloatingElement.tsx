"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  rotation?: number;
}

export function FloatingElement({
  children,
  className,
  delay = 0,
  duration = 4,
  yOffset = 15,
  rotation = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn("absolute", className)}
      animate={{
        y: [0, -yOffset, 0],
        rotate: [rotation, rotation + (rotation > 0 ? 5 : -5), rotation],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
