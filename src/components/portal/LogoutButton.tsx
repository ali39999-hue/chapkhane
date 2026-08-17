"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    } catch {
      // Even if the request fails, clear the session client-side and redirect.
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-600 font-medium hover:bg-red-50 transition-all duration-300 disabled:opacity-60"
    >
      <LogOut size={20} />
      {isLoading ? "در حال خروج..." : "خروج از حساب"}
    </button>
  );
}