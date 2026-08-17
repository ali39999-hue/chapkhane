"use client";

import { useState } from "react";
import { updateOrderStatus } from "./actions";
import { Printer, CheckCircle, Package, GripVertical, AlertTriangle, Layers, FileImage, ExternalLink, Printer as PrinterIcon } from "lucide-react";
import { formatNumber } from "@/utils/format-number";

interface KanbanClientProps {
  initialOrders: any[];
}

export const COLUMNS = [
  { id: "prepress", title: "لیتوگرافی و فرم‌بندی", icon: FileImage, color: "border-slate-300 bg-slate-50", headerColor: "bg-slate-200 text-slate-800" },
  { id: "printing", title: "سالن چاپ", icon: Printer, color: "border-blue-300 bg-blue-50/50", headerColor: "bg-blue-100 text-blue-800" },
  { id: "finishing", title: "پس از چاپ (صحافی)", icon: Layers, color: "border-indigo-300 bg-indigo-50/50", headerColor: "bg-indigo-100 text-indigo-800" },
  { id: "quality_check", title: "کنترل کیفیت نهایی", icon: AlertTriangle, color: "border-amber-300 bg-amber-50/50", headerColor: "bg-amber-100 text-amber-800" },
  { id: "ready", title: "آماده ارسال / انبار", icon: CheckCircle, color: "border-emerald-300 bg-emerald-50/50", headerColor: "bg-emerald-100 text-emerald-800" },
];

export function KanbanClient({ initialOrders }: KanbanClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, orderId: string, currentStatus: string) => {
    e.dataTransfer.setData("orderId", orderId);
    e.dataTransfer.setData("currentStatus", currentStatus);
    e.dataTransfer.effectAllowed = "move";
    
    // Defer state update so the element doesn't disappear under the cursor immediately
    setTimeout(() => setDraggedOrderId(orderId), 0);
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault(); // allow drop
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggedOrderId(null);
    
    const orderId = e.dataTransfer.getData("orderId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    if (currentStatus === targetStatus || !orderId) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: targetStatus } : o));
    setLoadingId(orderId);

    const res = await updateOrderStatus(orderId, targetStatus);
    
    if (!res.success) {
      alert(res.error);
      // Revert
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: currentStatus } : o));
    }
    
    setLoadingId(null);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 h-full items-start snap-x snap-mandatory">
      {COLUMNS.map(col => {
        const columnOrders = orders.filter(o => o.status === col.id);
        const isDragOver = dragOverCol === col.id;
        
        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-80 sm:w-96 rounded-2xl border-2 flex flex-col h-full max-h-full snap-center transition-colors duration-200 ${col.color} ${isDragOver ? 'ring-4 ring-primary-500/30 ring-offset-2 bg-white' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className={`p-4 sm:p-5 flex items-center justify-between rounded-t-xl ${col.headerColor}`}>
              <h3 className="font-black flex items-center gap-2 text-sm sm:text-base">
                <col.icon size={20} strokeWidth={2.5} />
                {col.title}
              </h3>
              <span className="w-7 h-7 bg-white/50 rounded-lg text-sm font-black flex items-center justify-center shadow-sm backdrop-blur-sm">
                {columnOrders.length}
              </span>
            </div>
            
            {/* Drop Zone / Cards List */}
            <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {columnOrders.map(order => {
                const isDragging = draggedOrderId === order.id;
                
                return (
                  <div 
                    key={order.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, order.id, order.status)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-300 transition-all ${
                      loadingId === order.id ? 'opacity-50 pointer-events-none animate-pulse' : ''
                    } ${
                      isDragging ? 'opacity-30 scale-95 border-dashed border-primary-500' : 'opacity-100'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="bg-secondary-50 px-4 py-2 border-b border-secondary-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-secondary-400" />
                        <span className="font-black font-mono text-secondary-900 text-sm">{order.orderNumber}</span>
                      </div>
                      <a 
                        href={`/admin/collections/orders/${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white border border-secondary-200 rounded-md text-secondary-500 hover:text-primary-600 transition-colors shadow-sm"
                        title="مشاهده در ادمین"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    
                    {/* Ticket Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[11px] text-secondary-500 font-bold mb-0.5">نام مشتری / همکار</p>
                          <p className="font-black text-secondary-900 text-sm truncate max-w-[200px]">
                            {typeof order.customer === 'object' ? (order.customer.fullName || order.customer.email || '—') : order.customer}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] text-secondary-500 font-bold mb-0.5">تاریخ ثبت</p>
                          <p className="text-xs font-bold text-secondary-700">
                            {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Ticket Specs */}
                      <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-secondary-600 flex items-center gap-1.5">
                            <Package size={14} className="text-secondary-400" />
                            تعداد اقلام چاپی:
                          </span>
                          <span className="font-black text-secondary-900 bg-white px-2 py-0.5 rounded shadow-sm border border-secondary-200">
                            {order.items?.length || 0} مورد
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ticket Footer */}
                    <div className="bg-secondary-50/50 px-4 py-3 border-t border-secondary-100 flex justify-between items-center">
                      <span className="font-black text-primary-700 text-sm" dir="ltr">
                        {formatNumber(order.totals?.total || 0)} <span className="text-[10px] text-secondary-500 font-bold font-sans">ریال</span>
                      </span>
                      <a
                        href={`/invoices/${order.id}/print`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] font-black text-secondary-700 hover:text-white bg-white hover:bg-primary-600 border border-secondary-200 hover:border-primary-600 px-3 py-2 rounded-lg transition-all shadow-sm"
                      >
                        <PrinterIcon size={14} />
                        چاپ برگه کار
                      </a>
                    </div>
                  </div>
                );
              })}
              
              {columnOrders.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-secondary-200 rounded-xl text-secondary-400 text-sm font-bold bg-white/50">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle size={20} className="text-secondary-300" />
                  </div>
                  خالی
                </div>
              )}
              
              {/* Extra spacing at bottom for drag targets */}
              <div className="h-8"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
