import Link from "next/link";
import { Cpu, Printer } from "lucide-react";
import { navLinks } from "./nav-links";
import { NavbarActions } from "./NavbarActions";

/**
 * Server component. Only `NavbarActions` crosses the client boundary.
 *
 * Pages that already render dynamically (portal, track) can pass
 * `isLoggedIn` from `getAuthContext()` to skip the client-side
 * `/api/users/me` round trip entirely.
 */
export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-200 font-sans shadow-sm" aria-label="ناوبری اصلی">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group" aria-label="چاپخانه نگار — صفحه اصلی">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <Printer className="text-white" size={24} strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-black text-secondary-900 block tracking-tight">چاپخانه نگار</span>
                <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
                  <Cpu size={12} aria-hidden="true" />
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

          <NavbarActions initialIsLoggedIn={isLoggedIn} />
        </div>
      </div>
    </nav>
  );
}
