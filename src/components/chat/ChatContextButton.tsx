"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { openChatWidget, type ChatContextKind } from "./chat-bus";

interface ChatContextButtonProps extends Omit<ButtonProps, "onClick"> {
  kind: ChatContextKind;
  /** Wajib bila kind === "order". */
  orderId?: string;
  label?: string;
  className?: string;
}

/**
 * Tombol yang membuka widget chat pada konteks tertentu
 * (keranjang atau pesanan). Bila belum login, arahkan ke /login.
 */
export function ChatContextButton({
  kind,
  orderId,
  label,
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: ChatContextButtonProps) {
  const { status } = useSession();
  const router = useRouter();

  const defaultLabel =
    kind === "cart" ? "Tanya Admin soal Keranjang" : "Chat soal pesanan ini";

  const handleClick = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    if (kind === "order" && !orderId) return;
    openChatWidget({ kind, orderId });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("gap-2 rounded-full", className)}
      {...rest}
    >
      <MessageCircle className="w-4 h-4" />
      {label ?? defaultLabel}
    </Button>
  );
}
