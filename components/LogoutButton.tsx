"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasUser =
      !!localStorage.getItem("dash_user_id") ||
      !!localStorage.getItem("dash_user_email") ||
      !!sessionStorage.getItem("dash_user_id") ||
      !!sessionStorage.getItem("dash_user_email");
    setIsLoggedIn(hasUser);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("dash_user_id");
      localStorage.removeItem("dash_user_email");
      sessionStorage.removeItem("dash_user_id");
      sessionStorage.removeItem("dash_user_email");
      router.refresh();
    } catch {
      // Still clear local state on error
      localStorage.removeItem("dash_user_id");
      localStorage.removeItem("dash_user_email");
      sessionStorage.removeItem("dash_user_id");
      sessionStorage.removeItem("dash_user_email");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
      aria-label="Log out"
    >
      {isLoggingOut ? "Logging out…" : "Log out"}
    </button>
  );
}
