"use client";

import { useState } from "react";
import { submitFeedback } from "./actions";
import { Button } from "@/components/ui/Button";

export function DesignFeedbackForm({ projectId }: { projectId: string }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (isApproved: boolean) => {
    if (!isApproved && !feedback.trim()) {
      alert("لطفاً دلایل نیاز به اصلاح را بنویسید.");
      return;
    }

    setLoading(true);
    const res = await submitFeedback(projectId, feedback, isApproved);
    if (!res.success) {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 mt-8 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">ثبت نظر روی اتود ارسالی</h3>
      <textarea
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 min-h-[100px] mb-4"
        placeholder="نظرات خود را بنویسید (در صورت نیاز به تغییرات)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      
      <div className="flex gap-4">
        <Button 
          onClick={() => handleAction(true)} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
        >
          تأیید نهایی طرح
        </Button>
        
        <Button 
          onClick={() => handleAction(false)} 
          disabled={loading}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          نیاز به اصلاح دارد
        </Button>
      </div>
    </div>
  );
}
