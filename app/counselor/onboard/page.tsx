"use client";

import { useRouter } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

const cardClass = "rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100 space-y-3";

export default function CounselorOnboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Floating back button */}
      <BackArrowButton
        variant="light"
        className="fixed left-4 top-4 z-50"
        onClick={() => router.push("/start")}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-14">
        <header className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Set up your Dash counselor account</h1>
          <p className="text-base leading-relaxed text-gray-600">
            This only takes a few minutes and is required to receive payments.
          </p>
        </header>

        <div className="flex-1 space-y-5">
          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Full legal name</p>
            <p className="text-sm text-gray-600">Enter your exact legal name for payouts.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Mobile number</p>
            <p className="text-sm text-gray-600">Use the number where you can be reached for verification.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Email</p>
            <p className="text-sm text-gray-600">We’ll send confirmations and payout notices here.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Business name</p>
            <p className="text-sm text-gray-600">Groman Mortuary</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Bank account</p>
            <p className="text-sm text-gray-600">Stripe Express onboarding (placeholder)</p>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => router.push("/counselor/payments")}
        >
          Continue to payments
        </button>
      </div>
    </main>
  );
}

