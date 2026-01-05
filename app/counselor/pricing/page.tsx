"use client";

import CounselorLanguageToggle from "../../../components/CounselorLanguageToggle";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PriceOption = "500" | "350" | "250";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 focus:outline-none focus:ring-2 focus:ring-gray-300";

export default function CounselorPricingPage() {
  const router = useRouter();
  const [price, setPrice] = useState<PriceOption>("500");
  const currentLang =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "es"
      ? "es"
      : "en";

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
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 px-6 pb-24 pt-10">
        <div className="flex items-center justify-end">
          <CounselorLanguageToggle />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            What to offer the customers:
          </p>
        </div>

        {/* Package */}
        <section className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Memorial package
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Timeless Memories Experience
            </h1>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 shadow-inner shadow-gray-100 ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Base price shown</p>
              <p className="text-lg font-semibold text-gray-900">$500</p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Memorial page • Printed cards • Hero portrait • QR memories
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-white px-4 py-3 shadow-inner shadow-gray-100 ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-900">Product info</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>Preserve memories. We do the work for you.</li>
              <li>100 premium 4&quot;x6&quot; memorial cards</li>
              <li>1 — 20&quot;x30&quot; hero portrait</li>
              <li>Lifetime QR code to unlock a lifetime of memories</li>
              <li>Up to 300 photos</li>
              <li>Prices include delivery, design, setup, and lifetime data; taxes not included.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Pricing controls</p>
            <p className="text-sm text-gray-600">
              Adjust prices as needed. These options are private and visible to counselors only.
            </p>
            <p className="text-sm text-gray-600">
              Prices do not include taxes. Taxes will automatically be billed to the customer at time of purchase.
            </p>
          </div>

          <div className="space-y-3">
            {(["500", "350", "250"] as PriceOption[]).map((option) => (
              <label
                key={option}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-inner shadow-gray-100"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="price"
                    value={option}
                    checked={price === option}
                    onChange={() => setPrice(option)}
                    className="h-4 w-4 accent-gray-900"
                  />
                  <span>${option}</span>
                </div>
                {option === "250" && (
                  <span className="text-xs font-medium text-gray-500">Minimum</span>
                )}
              </label>
            ))}
            {price === "250" && (
              <p className="text-sm text-gray-600">Requires manager approval</p>
            )}
          </div>
        </section>

      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.push(`/counselor/family-intake?lang=${currentLang}`)}
          className={primaryButtonClass}
        >
          Bill Client
        </button>
      </div>
    </main>
  );
}

