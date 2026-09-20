import React from "react";
import { cn } from "@/lib/utils";

interface DecorationProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export function Star({ className, color = "#F5A03A", ...props }: DecorationProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <path d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z" />
    </svg>
  );
}

export function Sparkle({ className, color = "#4776B9", ...props }: DecorationProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <path d="M9.5 3L11.5 8.5L17 10.5L11.5 12.5L9.5 18L7.5 12.5L2 10.5L7.5 8.5L9.5 3Z" />
      <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" />
    </svg>
  );
}

export function CatPaw({ className, color = "#F5A03A", ...props }: DecorationProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
      {...props}
    >
      <path d="M11.9997 12.1818C14.7371 12.1818 16.8997 14.5108 16.8997 16.8182C16.8997 19.1255 14.7371 21 11.9997 21C9.26224 21 7.09971 19.1255 7.09971 16.8182C7.09971 14.5108 9.26224 12.1818 11.9997 12.1818ZM7.27971 11.4545C8.63185 11.4545 9.72828 10.4373 9.72828 9.18182C9.72828 7.92636 8.63185 6.90909 7.27971 6.90909C5.92757 6.90909 4.83114 7.92636 4.83114 9.18182C4.83114 10.4373 5.92757 11.4545 7.27971 11.4545ZM11.9997 8.18182C13.3518 8.18182 14.4483 7.16455 14.4483 5.90909C14.4483 4.65364 13.3518 3.63636 11.9997 3.63636C10.6476 3.63636 9.55114 4.65364 9.55114 5.90909C9.55114 7.16455 10.6476 8.18182 11.9997 8.18182ZM16.7197 11.4545C18.0718 11.4545 19.1683 10.4373 19.1683 9.18182C19.1683 7.92636 18.0718 6.90909 16.7197 6.90909C15.3676 6.90909 14.2711 7.92636 14.2711 9.18182C14.2711 10.4373 15.3676 11.4545 16.7197 11.4545Z" />
    </svg>
  );
}

export function DoodleArrow({ className, color = "#4776B9", ...props }: DecorationProps) {
  return (
    <svg
      width="44"
      height="38"
      viewBox="0 0 44 38"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-10 h-10", className)}
      {...props}
    >
      <path d="M1.77663 36.1953C6.31518 25.5901 16.7844 14.0772 30.6391 10.7445" />
      <path d="M22.0469 3.01353C27.135 4.38531 33.3518 7.64069 36.4389 11.8398C33.4566 16.6577 28.5146 22.1815 23.4795 24.3149" />
    </svg>
  );
}
