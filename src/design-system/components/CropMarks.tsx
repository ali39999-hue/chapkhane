import React from 'react';
import { cn } from "@/utils/cn";

export const CropMarks = ({ children, className }: any) => {
  return (
    <div className={cn("relative p-4", className)}>
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gray-400"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gray-400"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gray-400"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gray-400"></div>
      {children}
    </div>
  );
};
