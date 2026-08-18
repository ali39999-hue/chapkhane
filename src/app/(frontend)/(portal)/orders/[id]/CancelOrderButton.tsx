"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { XCircle, Loader2 } from "lucide-react";
import { cancelOrder } from "./actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (window.confirm("آیا از لغو این سفارش اطمینان دارید؟ این عملیات غیرقابل بازگشت است.")) {
      startTransition(async () => {
        try {
          await cancelOrder(orderId);
        } catch (error: any) {
          alert(error.message || "خطا در لغو سفارش");
        }
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 font-bold transition-colors"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 size={18} className="ml-2 animate-spin" />
      ) : (
        <XCircle size={18} className="ml-2" />
      )}
      لغو سفارش
    </Button>
  );
}
