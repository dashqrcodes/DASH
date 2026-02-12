"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function CounselorSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);

  return (
    <main className="relative min-h-screen bg-white text-gray-900">
      <BackArrowButton
        variant="light"
        className="fixed left-4 top-4 z-50"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-8 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-28 pt-16 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Success!</h1>
          <p className="text-base leading-relaxed text-gray-700">
            Your DASH Memories Counselor Account is now ready to start onboarding new customers,
            accepting instant payments, and making automatic payments to BO Printing, and DASH.
            You no longer have to make manual payments. You will receive receipts via email for your records.
            Welcome to DASH!
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-white/95 px-6 pb-6 pt-4 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={() => router.push(`/counselor/faceid?lang=${currentLang}`)}
            className={primaryButtonClass}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}

