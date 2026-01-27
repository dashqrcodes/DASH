"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MemorialLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={`min-h-screen transition-opacity duration-300 ease-out ${visible ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
}
