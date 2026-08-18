import { notFound } from "next/navigation";
import { formatNumber } from "@/utils/format-number";
import { requireUser, isStaff } from "@/lib/auth";
import { parseBuyerInfo } from "@/lib/json-fields";
import { relationId } from "@/lib/relations";
import { PrintButton } from "@/components/ui/PrintButton";
import "./print.css";

export const dynamic = "force-dynamic";

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { payload, user }] = await Promise.all([params, requireUser()]);

  const invoice = await payload
    .findByID({
      collection: "invoices",
      id,
      depth: 1, // order + customer
      select: {
        serialNumber: true,
        createdAt: true,
        buyerInfo: true,
        customer: true,
        order: true,
      },
    })
    .catch(() => null);

  if (!invoice) notFound();

  // An invoice is a financial document: only its owner or staff may open it.
  if (!isStaff(user) && relationId(invoice.customer) !== user.id) {
    notFound();
  }

  const order = typeof invoice.order === 'object' ? invoice.order : null;
  const customer = typeof invoice.customer === 'object' ? invoice.customer : null;
  
  if (!order) return <div>سفارش یافت نشد.</div>;

  // Seller Demo Info (In a real app, this comes from Globals)
  const seller = {
    name: "چاپخانه آنلاین نگار",
    nationalId: "۱۰۱۰۰۰۰۰۰۰۰",
    economicCode: "۴۱۱۱۱۱۱۱۱۱۱۱",
    registrationNumber: "۱۲۳۴۵",
    phone: "۰۲۱-۸۸۸۸۸۸۸۸",
    address: "تهران، خیابان انقلاب، پلاک ۱",
    postalCode: "۱۴۱۱۱۱۱۱۱۱",
  };

  // Buyer Info
  const buyerInfo = parseBuyerInfo(invoice.buyerInfo);
  const buyer = {
    name: buyerInfo.fullName || customer?.fullName || "مشتری عمومی",
    nationalId: buyerInfo.nationalId || "-",
    economicCode: buyerInfo.economicCode || "-",
    phone: buyerInfo.phone || customer?.phone || customer?.email || "-",
    address: buyerInfo.address || "-",
    postalCode: buyerInfo.postalCode || "-",
  };

  const totals = order.totals ?? { subtotal: 0, discount: 0, vat: 0, total: 0 };

  return (
    <div className="print-container" dir="rtl">
      {/* Action bar (hidden in print) */}
      <div className="no-print bg-slate-800 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <p className="font-medium">جهت تهیه خروجی PDF یا چاپ فاکتور کلیک کنید</p>
        <PrintButton className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-bold" />
      </div>

      <div className="invoice-paper">
        {/* Header */}
        <div className="invoice-header">
          <div className="header-right">
            {/* Can add a logo here */}
            <h1 className="text-xl font-bold border-b border-black inline-block pb-1">فاکتور فروش کالا و خدمات</h1>
          </div>
          <div className="header-left text-sm">
            <p><strong>شماره سریال:</strong> {invoice.serialNumber}</p>
            <p><strong>تاریخ صدور:</strong> {new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</p>
            <p><strong>شماره سفارش:</strong> {order.orderNumber}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="info-box">
          <h2 className="info-title">مشخصات فروشنده</h2>
          <div className="info-grid">
            <p><strong>نام شخص حقیقی/حقوقی:</strong> {seller.name}</p>
            <p><strong>شماره اقتصادی:</strong> {seller.economicCode}</p>
            <p><strong>شناسه ملی:</strong> {seller.nationalId}</p>
            <p><strong>شماره ثبت:</strong> {seller.registrationNumber}</p>
            <p><strong>تلفن:</strong> {seller.phone}</p>
            <p><strong>کد پستی:</strong> {seller.postalCode}</p>
            <p className="col-span-full"><strong>آدرس:</strong> {seller.address}</p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="info-box">
          <h2 className="info-title">مشخصات خریدار</h2>
          <div className="info-grid">
            <p><strong>نام شخص حقیقی/حقوقی:</strong> {buyer.name}</p>
            <p><strong>شماره اقتصادی:</strong> {buyer.economicCode}</p>
            <p><strong>شناسه/کد ملی:</strong> {buyer.nationalId}</p>
            <p><strong>تلفن:</strong> {buyer.phone}</p>
            <p className="col-span-2"><strong>کد پستی:</strong> {buyer.postalCode}</p>
            <p className="col-span-full"><strong>آدرس:</strong> {buyer.address}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="w-12">ردیف</th>
              <th>شرح کالا یا خدمات</th>
              <th className="w-24">تعداد/مقدار</th>
              <th>مبلغ واحد (ریال)</th>
              <th>مبلغ کل (ریال)</th>
              <th>تخفیف (ریال)</th>
              <th>مبلغ پس از تخفیف (ریال)</th>
              <th>مالیات و عوارض (ریال)</th>
              <th>جمع کل (ریال)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">۱</td>
              <td>خدمات چاپ شامل سفارش {order.orderNumber} (پیوست ریز اقلام در پروفایل کاربری موجود است)</td>
              <td className="text-center">۱</td>
              <td className="text-center">{formatNumber(totals.subtotal)}</td>
              <td className="text-center">{formatNumber(totals.subtotal)}</td>
              <td className="text-center">{formatNumber(totals.discount)}</td>
              <td className="text-center">{formatNumber(totals.subtotal - totals.discount)}</td>
              <td className="text-center">{formatNumber(totals.vat)}</td>
              <td className="text-center font-bold">{formatNumber(totals.total)}</td>
            </tr>
            {/* Empty rows to fill space */}
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8} className="text-left font-bold border-l-0">جمع کل فاکتور:</td>
              <td className="text-center font-bold text-lg">{formatNumber(totals.total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div className="signatures">
          <div className="sig-box">
            <p>مهر و امضای فروشنده</p>
          </div>
          <div className="sig-box">
            <p>مهر و امضای خریدار</p>
          </div>
        </div>
      </div>
    </div>
  );
}
