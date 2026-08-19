import React from 'react';
import { cn } from "@/utils/cn";

export const Badge = ({ children, variant = "default", className }: any) => {
  const variants: any = {
    default: "bg-gray-100 text-gray-800",
    urgent: "bg-red-100 text-red-800 border border-red-200",
  };
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
};
