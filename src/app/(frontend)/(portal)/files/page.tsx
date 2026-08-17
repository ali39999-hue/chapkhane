import { FolderOpen, FileImage, Download, Search, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ForcePassButton } from "./ForcePassButton";
import { requireUser, scopeToUser } from "@/lib/auth";
import { parsePreflightResult } from "@/modules/preflight/result";

export const dynamic = "force-dynamic";

export default async function FilesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { payload, user } = await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const where = query
    ? { and: [scopeToUser(user, "owner"), { originalName: { contains: query } }] }
    : scopeToUser(user, "owner");

  const artworks = await payload.find({
    collection: "artworks",
    where,
    limit: 20,
    sort: "-createdAt",
    depth: 0,
    pagination: false,
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">فایل‌های من</h1>
          <p className="text-secondary-500 mt-2 font-medium text-sm">کتابخانه فایل‌ها و طرح‌های آپلود شده شما در سیستم ابری</p>
        </div>
        
        <div className="bg-secondary-50 border border-secondary-200 p-1.5 rounded-xl flex items-center w-full sm:w-auto focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <form action="/files" method="get" className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} aria-hidden="true" />
            <label htmlFor="file-search" className="sr-only">جستجو در فایل‌ها</label>
            <input
              id="file-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="جستجو در فایل‌ها..."
              className="pl-4 pr-10 py-2 rounded-lg border-none bg-transparent outline-none w-full sm:w-64 text-sm font-bold text-secondary-800 placeholder:text-secondary-400"
            />
          </form>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.docs.length > 0 ? artworks.docs.map((file) => {
          const preflight = parsePreflightResult(file.preflightResult);
          const sizeMb = file.filesize ? (file.filesize / (1024 * 1024)).toFixed(1) : null;

          return (
          <div key={file.id} className="bg-white border border-secondary-200 rounded-2xl p-4 shadow-sm group hover:shadow-md hover:border-primary-200 transition-all duration-300">
            <div className="aspect-square bg-secondary-50 rounded-xl flex items-center justify-center mb-4 border border-secondary-100 overflow-hidden relative">
              {/* Display preview if available, otherwise icon */}
              {file.previewPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.previewPath}
                  alt={`پیش‌نمایش ${file.originalName}`}
                  loading="lazy"
                  decoding="async"
                  className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <FileImage size={48} className="text-secondary-300 group-hover:text-primary-400 transition-colors" aria-hidden="true" />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-secondary-900/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Button variant="outline" className="bg-white border-none text-secondary-900 hover:bg-primary-50 hover:text-primary-700">
                  <Download size={18} className="ml-2" aria-hidden="true" />
                  دانلود
                </Button>
              </div>
            </div>
            <div>
              <p className="font-black text-secondary-900 text-sm truncate" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex justify-between items-center mt-2 mb-3">
                <p className="text-xs text-secondary-500 font-medium">
                  {new Date(file.createdAt).toLocaleDateString('fa-IR')}
                </p>
                {sizeMb && (
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-lg text-[10px] font-black">
                    {sizeMb} MB
                  </span>
                )}
              </div>
              
              {/* Preflight Status */}
              {preflight ? (
                <div className={`p-3 rounded-xl text-xs font-bold border ${
                  preflight.status === 'pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  preflight.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {preflight.status === 'pass' && <CheckCircle size={16} aria-hidden="true" />}
                    {preflight.status === 'warning' && <AlertTriangle size={16} aria-hidden="true" />}
                    {preflight.status === 'fail' && <XCircle size={16} aria-hidden="true" />}
                    <span>وضعیت کیفیت فایل</span>
                  </div>
                  {preflight.issues.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-1 opacity-90 font-medium">
                      {preflight.issues.map((iss, idx) => (
                        <li key={idx} className="truncate" title={iss}>{iss}</li>
                      ))}
                    </ul>
                  )}
                  {preflight.status === 'warning' && (
                    <div className="mt-3">
                      <ForcePassButton artworkId={file.id.toString()} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-secondary-50 text-secondary-500 rounded-xl text-xs flex items-center justify-center gap-2 border border-secondary-100 font-bold">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-secondary-400" aria-hidden="true"></span>
                  در حال بررسی کیفیت...
                </div>
              )}
            </div>
          </div>
          );
        }) : (
          <div className="col-span-full p-16 flex flex-col items-center justify-center text-secondary-400 bg-white rounded-2xl border border-secondary-200 shadow-sm">
            <FolderOpen size={48} className="mb-4 text-secondary-300" aria-hidden="true" />
            <p className="text-lg font-black text-secondary-800">پوشه فایل‌های شما خالی است.</p>
            <p className="text-sm font-medium mt-2">در هنگام ثبت سفارش جدید، فایل‌های شما در این کتابخانه ابری ذخیره می‌شوند.</p>
          </div>
        )}
      </div>
    </div>
  );
}
