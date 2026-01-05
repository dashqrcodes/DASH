"use client";

import { useRouter } from "next/navigation";

const baseClass =
  "fixed top-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-gray-900/10 backdrop-blur-xl ring-1 ring-white/60 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[44px] min-w-[44px]";

export default function BackButton() {
  const router = useRouter();

  return (
    <button type="button" className={baseClass} onClick={() => router.back()} aria-label="Back">
      <span className="text-lg leading-none">←</span>
      <span className="leading-none">Back</span>
    </button>
  );
}

