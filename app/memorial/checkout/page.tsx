"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-green-300/60";

const cardClass =
  "rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 space-y-4";

export default function MemorialCheckoutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-md ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={() => router.back()}
      >
        ←
      </button>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-16">
        <header className="mb-8 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Review &amp; confirm</h1>
        </header>

        <section className="space-y-6">
          <div className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Memorial Package</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• 50 memorial cards (4&quot;x6&quot;)</p>
              <p>• 1 hero portrait (20&quot;x30&quot;)</p>
              <p>• Lifetime profile &amp; slideshow</p>
              <p>• Life QR code &amp; forever link</p>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <p>Subtotal</p>
              <p className="font-semibold">$250.00</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <p>Sales tax (CA 9.5%)</p>
              <p className="font-semibold">$23.75</p>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-900 pt-2">
              <p>Total</p>
              <p>$273.75</p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => router.push("/memorial/experience")}
          >
            Pay now
          </button>
          <p className="mt-3 text-center text-xs text-gray-600">Delivery location: Groman Mortuary</p>
        </div>
      </div>
    </main>
  );
}



