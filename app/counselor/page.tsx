"use client";
export const dynamic = "force-dynamic";

import CounselorLanguageToggle from "../../components/CounselorLanguageToggle";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-300";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const formatPhone = (value: string) => {
  const digits = normalizePhone(value).slice(0, 10);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);
  return [part1, part2, part3].filter(Boolean).join("-");
};

export default function CounselorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const [familyPhone, setFamilyPhone] = useState("");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
              Dash
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-900">Sandy Macias</p>
              <p className="text-xs text-gray-500">Groman Mortuary</p>
            </div>
          </div>
          <CounselorLanguageToggle />
        </header>

        <div className="flex flex-1 flex-col gap-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Client Onboarding</h1>
          </div>

          <div className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">New client information</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Enter some basic client details and invite them to continue order.
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Surviving family member</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Trujillo"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mobile phone</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={familyPhone}
                  onChange={(e) => setFamilyPhone(formatPhone(e.target.value))}
                  placeholder="e.g. 323-555-0199"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email (optional)</label>
                <input
                  type="email"
                  placeholder="e.g. maria@example.com"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name of deceased</label>
                <input
                  type="text"
                  placeholder="e.g. Alejandro Ramirez"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sunrise (birth)</label>
                  <input
                    type="text"
                    placeholder="Month dd, yyyy"
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sunset (passing)</label>
                  <input
                    type="text"
                    placeholder="Month dd, yyyy"
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className={primaryButtonClass}
              onClick={() => router.push(`/counselor/pricing?lang=${currentLang}`)}
            >
              Send Invitation
            </button>
          </div>

          <div className="space-y-3 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Recent clients</p>
            </div>
            <div className="space-y-3 text-sm font-medium text-gray-700">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-xs ring-1 ring-gray-100">
                Maria Loreta Trujillo
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-xs ring-1 ring-gray-100">
                John Hernandez
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-xs ring-1 ring-gray-100">
                Carlos Mendoza
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-gray-500">
          DashMemories • Counselor Portal
        </footer>
      </div>
    </main>
  );
}
