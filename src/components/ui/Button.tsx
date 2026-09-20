"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-blue text-white hover:bg-[#3A649E] shadow-[0_4px_0_0_#2B4C7E] hover:shadow-[0_2px_0_0_#2B4C7E] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        secondary:
          "bg-brand-orange text-white hover:bg-[#E08F2A] shadow-[0_4px_0_0_#B8721B] hover:shadow-[0_2px_0_0_#B8721B] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        outline:
          "border-2 border-brand-blue text-brand-blue bg-white hover:bg-brand-blue-light shadow-[0_4px_0_0_#4776B9] hover:shadow-[0_2px_0_0_#4776B9] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        ghost: "hover:bg-brand-blue-light hover:text-brand-blue",
        link: "text-brand-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // If it's a ghost or link, we don't need the 3D translation effect
    if (variant === "ghost" || variant === "link") {
      return (
        <Comp
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50",
            {
              "hover:bg-brand-blue-light hover:text-brand-blue": variant === "ghost",
              "text-brand-blue underline-offset-4 hover:underline": variant === "link",
              "h-12 px-6 py-2": size === "default",
              "h-10 px-4 text-sm": size === "sm",
              "h-14 px-8 text-lg": size === "lg",
              "h-12 w-12": size === "icon",
            },
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
