"use client";

import { useState } from "react";
import { forcePassPreflight } from "./actions";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

export function ForcePassButton({ artworkId }: { artworkId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleForcePass() {
    if (!confirm("آیا اطمینان دارید که می‌خواهید این فایل با همین کیفیت چاپ شود؟ (مسئولیت افت کیفیت با شماست)")) {
      return;
    }
    
    setLoading(true);
    const res = await forcePassPreflight(artworkId);
    setLoading(false);
    
    if (res.error) {
      alert(res.error);
    }
  }

  return (
    <Button 
      onClick={handleForcePass} 
      disabled={loading}
      className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-none h-8"
      variant="outline"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin ml-1" />
      ) : (
        <AlertTriangle size={14} className="ml-1" />
      )}
      چاپ با مسئولیت من
    </Button>
  );
}
