"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveLang } from "@/lib/utils/lang";

type Step = "phone" | "otp" | "welcome";

const phoneNameMap: Record<string, string> = {
  "3238169644": "Sandy Macias",
  "2133922112": "Victor Guizado",
  "3238060128": "Lupita & Rolando Mendoza",
  "3234768005": "Isabel Gomez",
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const formatPhone = (value: string) => {
  const digits = normalizePhone(value).slice(0, 10);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);
  return [part1, part2, part3].filter(Boolean).join("-");
};

const inferCounselorName = (value: string) => {
  const digits = normalizePhone(value);
  return phoneNameMap[digits] ?? "Counselor";
};

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:translate-y-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none";

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [counselorName, setCounselorName] = useState("Counselor");
  const [mounted, setMounted] = useState(false);
  const currentLang = resolveLang(searchParams);
  const isSpanish = currentLang === "es";

  useEffect(() => {
    setMounted(true);
  }, []);

  const phoneDigits = normalizePhone(phone);
  const canContinue = phoneDigits.length > 0;
  const canVerify = otp.trim().length === 6;

  const handleContinue = () => {
    if (!canContinue) return;
    setCounselorName(inferCounselorName(phone));
    setStep("otp");
  };

  const handleVerify = () => {
    if (!canVerify) return;
    setCounselorName(inferCounselorName(phone));
    setStep("welcome");
  };

  const strings =
    currentLang === "es"
      ? {
          headerTitle: "Cuenta de consejeros",
          headerSubtitle: "DashMemories • Groman",
          welcomeTitle: "Bienvenido.",
          welcomeSubtitle: "Cuidemos los recuerdos de tus clientes juntos.",
          phoneLabel: "Numero de movil",
          phoneHelper: "Asociaremos este numero a tu perfil de consejero.",
          phonePlaceholder: "p. ej. 323-816-9644",
          continue: "Continuar",
          otpTitle: "Ingresa el codigo de verificacion",
          otpSubtitle: "Cualquier 6 digitos funcionan mientras finalizamos los mensajes.",
          otpLabel: "Codigo de 6 digitos",
          otpHelper: "No se envia SMS durante este piloto.",
          otpPlaceholder: "• • • • • •",
          verify: "Verificar",
          welcomeName: `Bienvenido, ${counselorName} – Funeraria Groman`,
          welcomeBody: "Ayudemos a las familias a compartir recuerdos.",
          welcomeCard:
            "Para comenzar a ayudar a tus clientes, configuremos tu cuenta de consejero DASH Memories. Te guiaremos en todo.",
          finalCta: "Presiona aqui",
        }
      : {
          headerTitle: "Counselor account",
          headerSubtitle: "DashMemories • Groman",
          welcomeTitle: "Welcome.",
          welcomeSubtitle: "Let's protect your client's memories together.",
          phoneLabel: "Mobile number",
          phoneHelper: "We'll match this number to your counselor profile.",
          phonePlaceholder: "e.g. 323-816-9644",
          continue: "Continue",
          otpTitle: "Enter verification code",
          otpSubtitle: "Any 6 digits work here while we finalize messaging.",
          otpLabel: "6-digit code",
          otpHelper: "No SMS is sent during this pilot.",
          otpPlaceholder: "• • • • • •",
          verify: "Verify",
          welcomeName: `Welcome, ${counselorName} – Groman Mortuary`,
          welcomeBody: "Let's help families share memories.",
          welcomeCard:
            "To begin helping your clients, let's set up your DASH Memories counselor account. We'll guide you through everything.",
          finalCta: "Press Here",
        };

  const updateLanguage = (lang: "en" | "es") => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("lang", lang);
    router.replace(`/start?${params.toString()}`);
  };

  return (
    <main
      className={`min-h-screen bg-white text-gray-900 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
              Dash
            </div>
            <div className="space-y-0.5">
                <p className="text-sm font-semibold text-gray-900">{strings.headerTitle}</p>
                <p className="text-xs text-gray-500">{strings.headerSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateLanguage(isSpanish ? "en" : "es")}
            className="relative flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700 shadow-inner ring-1 ring-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <span
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isSpanish ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <span className={`z-10 px-2 ${!isSpanish ? "text-gray-900" : "text-gray-500"}`}>
              English
            </span>
            <span className={`z-10 px-2 ${isSpanish ? "text-gray-900" : "text-gray-500"}`}>
              Español
            </span>
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center">
          {step === "phone" && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight">{strings.welcomeTitle}</h1>
                <p className="text-lg leading-relaxed text-gray-600">{strings.welcomeSubtitle}</p>
              </div>

              <div className="space-y-4 rounded-3xl">
                <label className="text-sm font-medium text-gray-700">{strings.phoneLabel}</label>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  placeholder={strings.phonePlaceholder}
                  className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 transition focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue}
                className={primaryButtonClass}
              >
                {strings.continue}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">{strings.otpTitle}</h1>
                <p className="text-base leading-relaxed text-gray-600">{strings.otpSubtitle}</p>
              </div>

              <div className="space-y-4 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
                <label className="text-sm font-medium text-gray-700">{strings.otpLabel}</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.slice(0, 6))}
                  placeholder={strings.otpPlaceholder}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white text-center text-lg tracking-[0.6em] text-gray-900 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <p className="text-sm text-gray-500">{strings.otpHelper}</p>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={!canVerify}
                className={primaryButtonClass}
              >
                {strings.verify}
              </button>
            </div>
          )}

          {step === "welcome" && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">{strings.welcomeName}</h1>
                <p className="text-base leading-relaxed text-gray-600">{strings.welcomeBody}</p>
              </div>

              <div className="rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-600">{strings.welcomeCard}</p>
              </div>

              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => router.push(`/counselor/payments?lang=${currentLang}`)}
              >
                {strings.finalCta}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
