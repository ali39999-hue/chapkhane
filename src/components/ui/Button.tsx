"use client";

import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "luxury";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    // `focus-visible` rather than `focus`, so the ring appears for keyboard and
    // AT users but not on mouse clicks.
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:active:scale-100 relative overflow-hidden";

    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30",
      secondary: "bg-secondary-500 text-white hover:bg-secondary-600 shadow-lg shadow-secondary-500/30",
      outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
      ghost: "text-secondary-600 hover:bg-secondary-100",
      luxury: "bg-ink-black text-gold-foil hover:bg-black border border-gold-foil/30 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all",
    };

    // Minimum 44px height on the two smaller sizes keeps every button above the
    // WCAG 2.2 target-size floor on touch devices.
    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    const busy = isLoading === true;

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={busy || props.disabled}
        // Announces the pending state instead of leaving AT users with a
        // silently disabled control.
        aria-busy={busy || undefined}
        {...props}
      >
        {busy ? (
          <>
            <span
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">در حال پردازش…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
