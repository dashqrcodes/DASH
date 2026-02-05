"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function CounselorFaceIdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const nextParam = searchParams?.get("next");
  const nextUrl = nextParam && nextParam.startsWith("/") ? nextParam : "/memorial/profile";

  return (
    <main className="relative min-h-screen bg-white text-gray-900">
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-md ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={() => router.back()}
      >
        ←
      </button>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-8 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-10 pt-14 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Enable Face ID</h1>
          <p className="text-base leading-relaxed text-gray-700">
            For quick, easy, private access tap "Enable Face ID"
          </p>
        </div>

        <div className="mt-8 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={() => router.push(nextUrl)}
            className={primaryButtonClass + " w-full"}
          >
            Enable Face ID
          </button>
          <button
            type="button"
            onClick={() => router.push(nextUrl)}
            className="mt-8 w-full text-center text-sm font-medium text-gray-600 underline underline-offset-4 pb-1"
          >
            Skip for now. I will manually input my credentials.
          </button>
        </div>
      </div>
    </main>
  );
}

