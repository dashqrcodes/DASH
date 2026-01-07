"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Lang = "en" | "es";

const buttonClass =
  "relative flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 shadow-inner shadow-gray-200 ring-1 ring-gray-200";

export default function CounselorLanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentLang, setCurrentLang] = useState<Lang>("en");

  useEffect(() => {
    const lang = searchParams?.get("lang") === "es" ? "es" : "en";
    setCurrentLang(lang);
  }, [searchParams]);

  const setLang = (lang: Lang) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("lang", lang);
    setCurrentLang(lang);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={() => setLang(currentLang === "es" ? "en" : "es")}
      aria-label="Language toggle"
    >
      <span
        className={`absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          currentLang === "es" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      <span className={`z-10 px-2 ${currentLang === "en" ? "text-gray-900" : "text-gray-500"}`}>
        English
      </span>
      <span className={`z-10 px-2 ${currentLang === "es" ? "text-gray-900" : "text-gray-500"}`}>
        Español
      </span>
    </button>
  );
}

