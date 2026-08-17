"use client";

import { useState, useTransition } from "react";
import { reorder } from "./actions";
import { Button } from "@/components/ui/Button";
import { Copy } from "lucide-react";

type Props = {
  orderId: string;
  /** `icon` renders a compact icon-only button for use inside table rows. */
  variant?: "default" | "icon";
};

export function ReorderButton({ orderId, variant = "default" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    startTransition(async () => {
      try {
        await reorder(orderId);
      } catch (err) {
        // `redirect()` inside a server action throws a control-flow error that
        // must be allowed to propagate; anything else is a real failure.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
        setError("خطا در ثبت سفارش مجدد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={run}
        disabled={isPending}
        title="سفارش مجدد (Reorder)"
        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Copy size={18} aria-hidden="true" />
        <span className="sr-only">سفارش مجدد</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={run}
        disabled={isPending}
        className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 shadow-lg shadow-primary-500/30"
      >
        <Copy size={18} aria-hidden="true" />
        {isPending ? "در حال کپی..." : "سفارش مجدد"}
      </Button>
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
