"use client";

import Link from "next/link";
import { User, Menu, Printer, Cpu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "محصولات چاپی", href: "/products" },
  { label: "قالب‌های استاندارد", href: "/templates" },
  { label: "راهنمای لیتوگرافی", href: "/guide" },
  { label: "تکنولوژی تولید", href: "/about" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => {
        if (!cancelled) setIsLoggedIn(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-200 font-sans shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <Printer className="text-white" size={24} strokeWidth={2} />
              </div>
              <div>
                <span className="text-xl font-black text-secondary-900 block tracking-tight">چاپخانه نگار</span>
                <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
                  <Cpu size={12} />
                  پلتفرم یکپارچه چاپ
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <LayoutDashboard size={18} />
                داشبورد من
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                ورود | ثبت‌نام
              </Link>
            )}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors"
            >
              <User size={18} />
              ورود همکاران
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="منو"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-secondary-100 shadow-lg">
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
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors text-center"
              >
                {isLoggedIn ? "داشبورد من" : "ورود | ثبت‌نام"}
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
    </nav>
  );
}