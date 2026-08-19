import React from 'react';
import { cn } from "@/utils/cn";

export const PriceTag = ({ amount, size = "md", className }: any) => {
  return (
    <div className={cn("font-bold text-primary-600 flex items-baseline gap-1", size === "sm" ? "text-lg" : "text-2xl", className)}>
      <span>{amount.toLocaleString('fa-IR')}</span>
      <span className="text-sm text-gray-500 font-normal">تومان</span>
    </div>
  );
};
