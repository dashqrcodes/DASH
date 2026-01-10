"use client";
export const dynamic = "force-dynamic";

import CounselorLanguageToggle from "../../../components/CounselorLanguageToggle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 focus:outline-none focus:ring-2 focus:ring-gray-300";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const formatPhone = (value: string) => {
  const digits = normalizePhone(value).slice(0, 10);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);
  return [part1, part2, part3].filter(Boolean).join("-");
};

export default function CounselorPaymentsPage() {
  const router = useRouter();
  const currentLang =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "es"
      ? "es"
      : "en";
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [mounted, setMounted] = useState(false);

  const isComplete = legalName && email && phone && routing && account;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      className={`relative min-h-screen bg-white text-gray-900 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-md ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={() => router.back()}
      >
        ←
      </button>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-10 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-20 pt-12">
        <div className="mb-6 flex items-center justify-end">
          <CounselorLanguageToggle />
        </div>
        <header className="mb-10 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Counselor account</p>
          <h1 className="text-3xl font-semibold tracking-tight">Set up counselor account & payments</h1>
          <p className="text-base leading-relaxed text-gray-600">
            Connect banking to get paid instantly for memorial packages.
          </p>
        </header>

        <section className="flex-1 space-y-5">
          <div className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Counselor legal name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Sandy Macias"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Counselor email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Counselor mobile number</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="e.g. 323-555-0199"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">Bank Account</p>
              <p className="text-sm text-gray-600">
                Enter your banking information. Your details are encrypted and secured through Stripe.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Routing number</label>
              <input
                type="text"
                inputMode="numeric"
                value={routing}
                onChange={(e) => setRouting(e.target.value)}
                placeholder="•••••••"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account number</label>
              <input
                type="text"
                inputMode="numeric"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <p className="text-xs text-gray-500">
              We use Stripe Connect Express for secure payouts. This is a UI-only mock—no live transfers.
            </p>
          </div>
        </section>

        <div className="mt-10">
          <button
            type="button"
            className={primaryButtonClass}
            disabled={!isComplete}
            onClick={() => router.push(`/counselor/success?lang=${currentLang}`)}
          >
            Enable payments
          </button>
        </div>
      </div>
    </main>
  );
}

