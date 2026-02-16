"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasUser =
      !!localStorage.getItem("dash_user_id") ||
      !!localStorage.getItem("dash_user_email") ||
      !!sessionStorage.getItem("dash_user_id") ||
      !!sessionStorage.getItem("dash_user_email");
    setIsLoggedIn(hasUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("dash_user_id");
      localStorage.removeItem("dash_user_email");
      sessionStorage.removeItem("dash_user_id");
      sessionStorage.removeItem("dash_user_email");
      router.refresh();
    } catch {
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
    <div ref={menuRef} className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={isOpen ? "true" : "false"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-lg bg-white/10 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <span className={`h-0.5 w-4 rounded-full bg-white transition ${isOpen ? "translate-y-1.5 rotate-45" : ""}`} />
        <span className={`h-0.5 w-4 rounded-full bg-white transition ${isOpen ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-4 rounded-full bg-white transition ${isOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[120px] rounded-lg bg-black/90 py-1 shadow-xl ring-1 ring-white/10">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
