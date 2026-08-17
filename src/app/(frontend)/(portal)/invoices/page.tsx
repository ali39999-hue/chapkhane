import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import { FileText, Printer, AlertCircle, Info } from "lucide-react";
import { formatNumber } from "@/utils/format-number";
import { requireUser, scopeToUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { payload, user } = await requireUser();

  // Only this user's own invoices (staff see everything)
  const invoices = await payload.find({
    collection: "invoices",
    where: scopeToUser(user, "customer"),
    sort: "-createdAt",
    limit: 50,
    depth: 1, // To get order details
    pagination: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">صورتحساب و فاکتورها</h1>
          <p className="text-secondary-500 mt-2 font-medium text-sm">مشاهده و چاپ فاکتورهای رسمی (مورد تایید دارایی) و پیش‌فاکتورها</p>
        </div>
      </div>

      <div className="bg-white border border-secondary-200 rounded-2xl shadow-sm overflow-hidden">
        {invoices.docs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-secondary-50 text-secondary-600 font-bold border-b border-secondary-200">
                <tr>
                  <th className="px-6 py-4">شماره سریال فاکتور</th>
                  <th className="px-6 py-4">سفارش مربوطه</th>
                  <th className="px-6 py-4">تاریخ صدور</th>
                  <th className="px-6 py-4">مبلغ مالیات (ریال)</th>
                  <th className="px-6 py-4 text-center">عملیات چاپ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {invoices.docs.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-secondary-50 transition-colors group">
                    <td className="px-6 py-5 font-black text-secondary-900 font-mono">
                      {invoice.serialNumber}
                    </td>
                    <td className="px-6 py-5 text-secondary-600 font-black font-mono">
                      {typeof invoice.order === 'object' ? invoice.order.orderNumber : invoice.order}
                    </td>
                    <td className="px-6 py-5 text-secondary-500 font-medium">
                      {new Date(invoice.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-5 font-bold text-secondary-800">
                      {formatNumber(invoice.vatAmount)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/invoices/${invoice.id}/print`}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                        >
                          <Printer size={16} />
                          چاپ فاکتور
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-secondary-400 bg-secondary-50/50">
            <FileText size={48} className="mb-4 text-secondary-300" />
            <p className="text-lg font-black text-secondary-800">هیچ فاکتور رسمی صادر نشده است.</p>
            <p className="text-sm mt-2 font-medium">فاکتور رسمی دارایی پس از پرداخت نهایی هر سفارش به‌صورت خودکار صادر می‌گردد.</p>
          </div>
        )}
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex gap-4 text-primary-800 shadow-sm">
        <Info className="shrink-0 mt-0.5 text-primary-600" size={24} />
        <div className="text-sm">
          <p className="font-black text-base mb-1">نکته درباره فاکتورهای دارایی:</p>
          <p className="font-medium leading-relaxed">تمامی فاکتورهای صادر شده در این بخش دارای فرمت استاندارد اداره مالیات بوده و به محض کلیک روی "چاپ فاکتور رسمی"، نسخه چاپیِ آماده به فرمت A4 بدون منوهای سایت باز می‌شود که می‌توانید آن را مستقیماً به PDF تبدیل (Save as PDF) کرده یا پرینت بگیرید.</p>
        </div>
      </div>
    </div>
  );
}
