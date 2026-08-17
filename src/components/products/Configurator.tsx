"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  Calculator, UploadCloud, FileCheck, HelpCircle, 
  Settings2, Package, ChevronDown, Cpu, Sparkles, Server, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type ConfiguratorProps = {
  product: any;
  papers: any[];
  sizes: any[];
  finishings: any[];
  turnarounds: any[];
};

export function Configurator({ product, papers, sizes, finishings, turnarounds }: ConfiguratorProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Config state
  const [selectedPaper, setSelectedPaper] = useState(papers[0]?.id || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.id || "");
  const [selectedFinishing, setSelectedFinishing] = useState<string>("none");
  const [selectedTurnaround, setSelectedTurnaround] = useState(turnarounds[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1000);
  const [grammage, setGrammage] = useState<number>(
    papers[0]?.allowedGrammages?.[0]?.grammage ?? 80
  );

  // File Upload Status
  const [fileStatus, setFileStatus] = useState<"idle" | "analyzing" | "passed" | "error">("idle");
  const [artworkId, setArtworkId] = useState<number | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checkout state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Live server quote
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Find active selections for invoice display
  const activePaper = papers.find(p => p.id === selectedPaper);
  const activeSize = sizes.find(s => s.id === selectedSize);
  const activeFinishing = finishings.find(f => f.id === selectedFinishing);
  const activeTurnaround = turnarounds.find(t => t.id === selectedTurnaround);

  const config = useMemo(
    () => ({
      productTypeSlug: product.slug,
      size: {
        id: selectedSize,
        width: activeSize?.finalWidth,
        height: activeSize?.finalHeight,
      },
      paperTypeId: selectedPaper,
      grammage,
      sides: 1,
      quantity,
      finishing: selectedFinishing !== "none" ? [{ id: selectedFinishing }] : [],
      turnaroundId: selectedTurnaround,
    }),
    [product.slug, selectedSize, activeSize, selectedPaper, grammage, quantity, selectedFinishing, selectedTurnaround]
  );

  // Fetch the authoritative price from the pricing engine on every config change.
  useEffect(() => {
    if (!product.slug || !selectedPaper || !selectedTurnaround) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const res = await fetch("/api/pricing/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        const data = await res.json();
        if (!cancelled && res.ok) setQuote(data);
      } catch {
        // Leave the previous quote; the payment invoice is the final authority.
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config]);

  // Reset grammage when the paper changes.
  useEffect(() => {
    const grams = activePaper?.allowedGrammages;
    if (grams && grams.length > 0) setGrammage(grams[0].grammage);
  }, [selectedPaper]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPrice = quote?.total ?? null;

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    setFileError("");
    setFileStatus("analyzing");
    setArtworkId(null);

    const fd = new FormData();
    fd.append("file", file);

    fetch("/api/upload-artwork", { method: "POST", body: fd, credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setFileStatus("error");
          setFileError(data.error || "خطا در آپلود فایل");
          return;
        }
        setArtworkId(data.artworkId);
        setFileStatus("passed");
      })
      .catch(() => {
        setFileStatus("error");
        setFileError("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
      });
  };

  const handleSubmit = async () => {
    if (fileStatus !== "passed" || !artworkId || submitting) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ config, artworkId }],
          shippingAddress: {},
          paymentMethod: "gateway",
        }),
      });

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "خطا در ثبت سفارش");
        setSubmitting(false);
        return;
      }

      router.push(`/mock-payment/${data.orderId}`);
    } catch {
      setSubmitError("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* LEFT COLUMN: Controls & Workbench */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        
        {/* 3D Visualizer / Workbench */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-2xl h-80 sm:h-96 flex items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-slate opacity-20"></div>
          
          <div className="relative z-10 w-full h-full p-8 flex items-center justify-center transform hover:scale-105 transition-transform duration-700 ease-out">
            {product.images?.[0]?.url ? (
              <Image 
                src={product.images[0].url} 
                alt={product.name} 
                fill 
                className="object-contain drop-shadow-xl" 
              />
            ) : (
              <div className="w-32 h-32 bg-white rounded-2xl border border-secondary-200 shadow-sm flex items-center justify-center text-secondary-300">
                <Package size={64} />
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white border border-secondary-200 text-secondary-500 rounded-md text-[10px] font-mono shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> 3D PREVIEW
            </span>
            <span className="px-3 py-1 bg-white border border-secondary-200 text-primary-500 rounded-md text-[10px] font-mono shadow-sm">
              CMYK MODE
            </span>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white border border-secondary-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-secondary-100">
            <Settings2 className="text-primary-500" size={20} />
            <h2 className="text-lg font-black text-secondary-900">پارامترهای تولید صنعتی</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Paper Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600 flex justify-between">
                نوع متریال (کاغذ)
              </label>
              <div className="relative">
                <select 
                  value={selectedPaper} 
                  onChange={(e) => setSelectedPaper(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  {papers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Grammage */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600 flex justify-between">
                گرماژ (گرم در متر مربع)
              </label>
              <div className="relative">
                <select 
                  value={grammage} 
                  onChange={(e) => setGrammage(Number(e.target.value))}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  {(activePaper?.allowedGrammages?.length ? activePaper.allowedGrammages : [{ grammage: 80 }, { grammage: 100 }, { grammage: 120 }]).map((g: any, idx: number) => (
                    <option key={idx} value={g.grammage}>{g.grammage} g/m²</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600 flex justify-between">
                ابعاد نهایی (برش خورده)
              </label>
              <div className="relative">
                <select 
                  value={selectedSize} 
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Finishing Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600 flex justify-between">
                عملیات تکمیلی (پس‌از‌چاپ)
              </label>
              <div className="relative">
                <select 
                  value={selectedFinishing} 
                  onChange={(e) => setSelectedFinishing(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="none">بدون روکش (استاندارد)</option>
                  {finishings.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Turnaround Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600 flex justify-between">
                زمان تحویل (لجستیک)
              </label>
              <div className="relative">
                <select 
                  value={selectedTurnaround} 
                  onChange={(e) => setSelectedTurnaround(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  {turnarounds.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-secondary-600">تیراژ چاپ (عدد)</label>
              <div className="flex gap-2">
                {[1000, 2000, 5000].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all border ${
                      quantity === q 
                        ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm" 
                        : "bg-white border-secondary-200 text-secondary-600 hover:border-primary-300 hover:bg-secondary-50"
                    }`}
                  >
                    {q.toLocaleString("fa-IR")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preflight Engine / File Upload */}
        <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-dots opacity-20"></div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.zip"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
          
          {fileStatus === "idle" && (
            <div className="relative z-10 w-full py-8">
              <div className="w-16 h-16 bg-primary-50 border border-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-base font-bold text-secondary-900 mb-2">Preflight ابری فایل</h3>
              <p className="text-secondary-500 text-sm mb-6 max-w-sm mx-auto font-medium">
                فایل طراحی خود را آپلود کنید تا موتور هوشمند ما رنگ‌ها، حاشیه برش و رزولوشن را بررسی کند.
                فرمت‌های مجاز: PDF، PNG، JPG، WEBP و ZIP.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-secondary-900 hover:bg-secondary-800 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md"
              >
                انتخاب فایل و شروع بررسی
              </button>
            </div>
          )}

          {fileStatus === "analyzing" && (
            <div className="relative z-10 w-full py-8 space-y-6">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 border-4 border-secondary-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                <Cpu size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500" />
              </div>
              <h3 className="text-base font-bold text-secondary-900">در حال آپلود و پردازش فایل...</h3>
              <p className="text-xs text-secondary-400 font-medium">بررسی رنگ، حاشیه امن و رزولوشن توسط موتور Preflight</p>
            </div>
          )}

          {fileStatus === "passed" && (
            <div className="relative z-10 w-full py-8">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileCheck size={32} />
              </div>
              <h3 className="text-lg font-black text-emerald-700 mb-2">فایل آپلود و تایید شد</h3>
              <p className="text-secondary-600 text-sm mb-6 font-medium">فایل شما تایید شد. لطفاً برای نهایی‌کردن سفارش روی دکمه پرداخت آنلاین (سبز رنگ) کلیک کنید.</p>
              <button 
                onClick={() => {
                  setFileStatus("idle");
                  setArtworkId(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs font-bold text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                تغییر فایل
              </button>
            </div>
          )}

          {fileStatus === "error" && (
            <div className="relative z-10 w-full py-8">
              <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-lg font-black text-red-600 mb-2">خطا در آپلود فایل</h3>
              <p className="text-secondary-600 text-sm mb-6">{fileError || "فرمت فایل پشتیبانی نمی‌شود."}</p>
              <button 
                onClick={() => {
                  setFileStatus("idle");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="bg-secondary-900 hover:bg-secondary-800 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md"
              >
                انتخاب فایل دیگر
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Invoice & Summary */}
      <div className="w-full lg:w-1/3 sticky top-24">
        <div className="bg-white border border-secondary-200 rounded-2xl shadow-float overflow-hidden">
          
          {/* Header */}
          <div className="bg-secondary-50 border-b border-secondary-200 p-6">
            <h3 className="text-lg font-black text-secondary-900 flex items-center gap-2">
              <Calculator size={20} className="text-primary-500" />
              پیش‌فاکتور سیستمی
            </h3>
            <p className="text-secondary-500 text-xs mt-1 font-medium">
              قیمت به صورت زنده توسط موتور قیمت‌گذاری محاسبه می‌شود
            </p>
          </div>

          {/* Line Items */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-secondary-100 border-dashed">
              <div>
                <div className="text-sm font-bold text-secondary-900">{product.name}</div>
                <div className="text-xs text-secondary-500 mt-1">
                  {quantity.toLocaleString("fa-IR")} عدد
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">متریال:</span>
                <span className="font-bold text-secondary-900">{activePaper?.name || "-"} · {grammage} g/m²</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">ابعاد:</span>
                <span className="font-bold text-secondary-900">{activeSize?.name || "-"}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">روکش:</span>
                <span className="font-bold text-secondary-900">{activeFinishing?.name || "بدون روکش"}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">تحویل:</span>
                <span className="font-bold text-secondary-900 bg-secondary-100 px-2 py-0.5 rounded text-xs">{activeTurnaround?.name || "-"}</span>
              </li>
            </ul>

            {quote?.breakdown?.map((row: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs text-secondary-500 border-t border-secondary-100 pt-2">
                <span>{row.label}</span>
                <span className="font-bold">{Number(row.amount).toLocaleString("fa-IR")} ریال</span>
              </div>
            ))}

            {quote?.warnings?.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg font-medium space-y-1">
                {quote.warnings.map((w: string, idx: number) => (
                  <p key={idx} className="flex items-center gap-1"><HelpCircle size={12} /> {w}</p>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="p-6 bg-secondary-900 text-white">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-secondary-400 font-bold">مبلغ قابل پرداخت:</span>
              <div className="text-left">
                {totalPrice !== null ? (
                  <div className="text-3xl font-black text-white">
                    {totalPrice.toLocaleString("fa-IR")} <span className="text-sm font-normal text-secondary-400">ریال</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-secondary-400 font-bold">
                    {quoteLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        در حال محاسبه...
                      </>
                    ) : (
                      "در انتظار محاسبه قیمت"
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button 
              className="w-full h-14 text-base font-bold bg-primary-600 hover:bg-primary-500 text-white border-0 shadow-lg"
              disabled={fileStatus !== "passed" || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  در حال ثبت سفارش...
                </span>
              ) : fileStatus === "passed" ? (
                "تایید نهایی و پرداخت آنلاین"
              ) : (
                "ابتدا فایل را آپلود کنید"
              )}
            </Button>
            
            {submitError && (
              <p className="text-center text-xs text-red-300 mt-3 font-bold">{submitError}</p>
            )}
            
            {fileStatus !== "passed" && (
              <p className="text-center text-xs text-amber-400 mt-3 font-bold flex items-center justify-center gap-1">
                <Server size={14} />
                منتظر تایید فایل توسط سرور Preflight
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}