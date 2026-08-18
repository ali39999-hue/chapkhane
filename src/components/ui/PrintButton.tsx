"use client";

import { Printer } from "lucide-react";

/**
 * Small client island for the print action.
 *
 * The print page is a server component; it previously injected the handler with
 * `dangerouslySetInnerHTML` plus a `getElementById` lookup, which breaks if the
 * button is ever re-rendered and bypasses React entirely.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer size={16} className="inline-block ml-2" />
      چاپ / دانلود PDF
    </button>
  );
}
