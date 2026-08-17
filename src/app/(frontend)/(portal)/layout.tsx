import { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/portal/LogoutButton";
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  FolderOpen,
  Building2,
  PenTool,
  Wallet,
  Cpu
} from "lucide-react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const menuItems = [
    { name: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
    { name: "سفارش‌های من", href: "/orders", icon: Package },
    { name: "فایل‌های من", href: "/files", icon: FolderOpen },
    { name: "پنل همکار (B2B)", href: "/b2b", icon: Building2 },
    { name: "خدمات طراحی", href: "/design", icon: PenTool },
    { name: "کیف پول", href: "/wallet", icon: Wallet },
    { name: "صورتحساب و مالی", href: "/invoices", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />

      {/* Sidebar - Light Industrial */}
      <aside className="w-64 hidden md:flex flex-col fixed inset-y-0 right-0 z-50 bg-white border-l border-secondary-200 shadow-soft">
        <div className="p-6 flex items-center justify-center border-b border-secondary-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-xl font-black text-secondary-900 block">نگار سیستم</span>
              <span className="text-[10px] text-primary-600 font-bold block">پنل کاربری چاپخانه</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 font-bold hover:bg-secondary-50 hover:text-primary-700 transition-all duration-200 group border border-transparent hover:border-secondary-200"
            >
              <div className="p-2 rounded-lg bg-secondary-100 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                <item.icon size={18} />
              </div>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-100 bg-secondary-50/50">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pr-64 min-w-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
