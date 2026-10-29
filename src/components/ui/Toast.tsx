"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, X, Info, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; message: string; type: "success" | "error" | "info" };
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Animate out before removal
    const t2 = setTimeout(() => setVisible(false), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-blue shrink-0" />,
  };

  const borders = {
    success: "border-green-200",
    error: "border-red-200",
    info: "border-brand-blue-light",
  };

  return (
    <div
      className={`
        flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl
        border-2 ${borders[toast.type]} min-w-[280px] max-w-[360px]
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {icons[toast.type]}
      <p className="text-sm font-bold text-foreground flex-grow">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-foreground/30 hover:text-foreground/70 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
