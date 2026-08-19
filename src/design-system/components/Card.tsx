import React from 'react';
import { cn } from "@/utils/cn";

export const Card = ({ children, className, withHoverEffect, ...props }: any) => {
  return (
    <div 
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        withHoverEffect && "transition-all hover:shadow-md hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
