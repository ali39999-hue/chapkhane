import { KanbanClient, type KanbanOrder } from "./KanbanClient";
import Link from "next/link";
import { ArrowRight, LogOut, Settings2, Cpu } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

const BOARD_STATUSES = ["prepress", "printing", "finishing", "quality_check", "ready"] as const;

export default async function ProductionBoardPage() {
  const { payload } = await requireStaff();

  const orders = await payload.find({
    collection: "orders",
    // A single `in` predicate instead of five `or`-ed equals, which matches the
    // existing ['status', 'createdAt'] index.
    where: { status: { in: BOARD_STATUSES } },
    // The board only renders the customer's display name, the item count and
    // the total. `depth: 1` + no `select` shipped every order's priceSnapshot,
    // shippingAddress and fully-populated order-items to the browser.
    depth: 1,
    limit: 100, // Fetch up to 100 active production orders
    sort: "createdAt",
    select: {
      orderNumber: true,
      status: true,
      createdAt: true,
      customer: true,
      items: true,
      totals: true,
    },
  });

  const boardOrders: KanbanOrder[] = orders.docs.map((order) => {
    const customer = order.customer;
    const customerName =
      typeof customer === "object" && customer !== null
        ? customer.fullName || customer.email || "—"
        : String(relationId(customer) ?? "—");

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      customerName,
      itemCount: order.items?.length ?? 0,
      total: order.totals?.total ?? 0,
    };
  });

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />

      {/* Industrial Header */}
      <header className="bg-white border-b border-secondary-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-50 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm shrink-0">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-secondary-900 flex items-center gap-2">
              <Cpu size={24} className="text-primary-600" />
              عملیات خط تولید چاپخانه (Kanban)
            </h1>
            <p className="text-sm text-secondary-500 font-bold mt-1">
              جهت تغییر وضعیت کارها، سفارشات را بکشید و در ستون مربوطه رها کنید (Drag & Drop)
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 border-t sm:border-t-0 border-secondary-100 pt-3 sm:pt-0">
          <div className="flex items-center bg-primary-50 border border-primary-100 text-primary-700 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm font-black">
              {orders.totalDocs} سفارش در جریان
            </span>
          </div>
          
          <button className="w-10 h-10 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center justify-center text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm" title="تنظیمات بورد">
            <Settings2 size={20} />
          </button>
          
          <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-xl transition-all shadow-sm">
            <LogOut size={16} />
            <span className="hidden sm:inline">خروج از سیستم کارگاهی</span>
          </Link>
        </div>
      </header>

      {/* Main Kanban Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <KanbanClient initialOrders={boardOrders} />
      </div>
    </main>
  );
}
