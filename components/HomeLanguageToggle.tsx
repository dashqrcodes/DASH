"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLang, persistLang, resolveLang } from "@/lib/utils/lang";

export default function HomeLanguageToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<AppLang>("en");

  useEffect(() => {
    setLang(resolveLang(searchParams));
  }, [searchParams]);

  useEffect(() => {
    persistLang(lang);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (params.get("lang") !== lang) {
      params.set("lang", lang);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    }
  }, [lang, router, searchParams]);

  return (
    <>
      <div className="mt-8 flex items-center justify-center">
        <div className="relative flex items-center rounded-full bg-white/10 px-1 py-1 ring-1 ring-white/15 backdrop-blur">
          <div
            className={`absolute inset-y-1 w-1/2 rounded-full bg-white shadow-lg transition-transform duration-200 ${
              lang === "es" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              lang === "en" ? "text-gray-900" : "text-white/80 hover:text-white"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("es")}
            className={`relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              lang === "es" ? "text-gray-900" : "text-white/80 hover:text-white"
            }`}
          >
            Español
          </button>
        </div>
      </div>

      <div className="mt-auto w-full pb-16 pt-12">
        <Link
          href={`/memorial/profile?lang=${lang}`}
          className="mx-auto flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-white text-base font-semibold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Start
        </Link>
      </div>
    </>
  );
}
