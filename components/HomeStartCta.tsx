"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveLang } from "@/lib/utils/lang";

export default function HomeStartCta() {
  const searchParams = useSearchParams();
  const lang = resolveLang(searchParams);

  return (
    <div className="mt-auto w-full pb-24 pt-6">
      <Link
        href={`/memorial/profile?lang=${lang}`}
        className="mx-auto flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-white text-base font-semibold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        Continue
      </Link>
    </div>
  );
}
