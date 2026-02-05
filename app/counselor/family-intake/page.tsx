"use client";
export const dynamic = "force-dynamic";

import CounselorLanguageToggle from "../../../components/CounselorLanguageToggle";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resolveLang } from "@/lib/utils/lang";

type PriceOption = "500" | "350" | "250";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300/60";

export default function FamilyIntakePage() {
  const router = useRouter();
  const [price, setPrice] = useState<PriceOption>("350");
  const [familyPhone, setFamilyPhone] = useState("");
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);

  const normalizePhone = (value: string) => value.replace(/\D/g, "");
  const formatPhone = (value: string) => {
    const digits = normalizePhone(value).slice(0, 10);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    return [part1, part2, part3].filter(Boolean).join("-");
  };

  const strings =
    currentLang === "es"
      ? {
          title: "Ingreso familiar",
          subtitle: "Recopila datos clave antes del pago. Sin cargas aquí—solo contacto y precios.",
          honoree: "Nombre completo del homenajeado *",
          familyFirst: "Nombre de pila de la familia *",
          familyLast: "Apellido de la familia *",
          mobile: "Teléfono móvil *",
          email: "Correo electrónico (opcional)",
          pricing: "Precios",
          counselorSet: "Fijado por el consejero",
          helper: "Controlas el precio final que ve la familia.",
          cta: "Continuar",
        }
      : {
          title: "Family intake",
          subtitle: "Collect key details before checkout. No uploads here—just contact and pricing.",
          honoree: "Honoree's full name *",
          familyFirst: "Family first name *",
          familyLast: "Family last name *",
          mobile: "Mobile phone *",
          email: "Email (optional)",
          pricing: "Pricing",
          counselorSet: "Counselor-set",
          helper: "You control the final price shown to the family.",
          cta: "Continue",
        };

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
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-3 pb-24 pt-10">
        <div className="mb-6 flex items-center justify-end">
          <CounselorLanguageToggle />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{strings.title}</h1>
            <p className="text-base leading-relaxed text-gray-600">{strings.subtitle}</p>
          </div>

          <div className="space-y-5 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{strings.honoree}</label>
              <input
                required
                type="text"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. Maria Loreta Trujillo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{strings.familyFirst}</label>
              <input
                required
                type="text"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. Maria"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{strings.familyLast}</label>
              <input
                required
                type="text"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. Trujillo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{strings.mobile}</label>
              <input
                required
                type="tel"
                inputMode="tel"
                value={familyPhone}
                onChange={(e) => setFamilyPhone(formatPhone(e.target.value))}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. 323-555-0199"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{strings.email}</label>
              <input
                type="email"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. maria@example.com"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{strings.pricing}</p>
              <p className="text-xs text-gray-500">{strings.counselorSet}</p>
            </div>
            <div className="space-y-3">
              {(["500", "350", "250"] as PriceOption[]).map((value) => (
                <label
                  key={value}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-inner shadow-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="price"
                      value={value}
                      checked={price === value}
                      onChange={() => setPrice(value)}
                      className="h-4 w-4 accent-gray-900"
                    />
                    <span>${value}</span>
                  </div>
                  {value === "250" && <span className="text-xs font-medium text-gray-500">Min</span>}
                  {value === "350" && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Default
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500">{strings.helper}</p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.push(`/memorial/accept?counselor=Groman&lang=${currentLang}`)}
          className={primaryButtonClass}
        >
          {strings.cta}
        </button>
      </div>
    </main>
  );
}

