"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, User, X } from "lucide-react";
import { navLinks } from "./nav-links";

/**
 * The only interactive part of the navbar: the auth-dependent CTA and the
 * mobile drawer.
 *
 * The whole navbar used to be a client component that also issued
 * `fetch('/api/users/me')` on mount from every public page. Keeping the shell
 * on the server shrinks what ships to the browser, and `initialIsLoggedIn`
 * lets already-dynamic pages pass the server-resolved value so no client
 * request happens at all.
 *
 * On statically prerendered pages the value is unknown at build time, so the
 * fetch remains — but the CTA renders a fixed-width neutral state until it
 * resolves, so there is no layout shift.
 */
export function NavbarActions({ initialIsLoggedIn }: { initialIsLoggedIn?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(initialIsLoggedIn ?? null);

  useEffect(() => {
    if (initialIsLoggedIn !== undefined) return;

    const controller = new AbortController();
    fetch("/api/users/me", { credentials: "include", signal: controller.signal })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => {
        if (!controller.signal.aborted) setIsLoggedIn(false);
      });

    return () => controller.abort();
  }, [initialIsLoggedIn]);

  const primaryHref = isLoggedIn ? "/dashboard" : "/login";
  const primaryLabel = isLoggedIn === null ? "حساب کاربری" : isLoggedIn ? "داشبورد من" : "ورود | ثبت‌نام";

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={primaryHref}
          className="hidden sm:flex items-center justify-center gap-2 min-w-[9.5rem] px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          {isLoggedIn ? <LayoutDashboard size={18} aria-hidden="true" /> : null}
          {primaryLabel}
        </Link>

        <Link
          href="/admin"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors"
        >
          <User size={18} aria-hidden="true" />
          ورود همکاران
        </Link>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer — absolutely positioned so it can live inside the header
          row without disturbing its flex layout. */}
      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden absolute top-20 left-0 right-0 bg-white border-t border-secondary-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-bold text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-secondary-100 flex flex-col gap-2">
              <Link
                href={primaryHref}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors text-center"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-bold text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors text-center"
              >
                ورود همکاران
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
