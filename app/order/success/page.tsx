"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const memorialName = searchParams?.get("name") || "";
  const birthDate = searchParams?.get("birth") || "";
  const deathDate = searchParams?.get("death") || "";
  const slug = searchParams?.get("slug") || "";

  const strings =
    currentLang === "es"
      ? {
          title: "Gracias.",
          body: "Estamos trabajando en tu pedido y lo entregaremos.",
          continue: "Continuar",
        }
      : {
          title: "Thank you.",
          body: "We are working diligently on your order and will deliver to Groman Mortuary.",
          continue: "Continue",
        };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        onClick={() => router.back()}
      >
        ←
      </button>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-16 text-center">
        <div className="flex flex-1 flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{strings.title}</h1>
          <p className="text-base leading-relaxed text-white/90">{strings.body}</p>
        </div>

        <div className="w-full pt-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/slideshow/create${[
                  memorialName ? `name=${encodeURIComponent(memorialName)}` : "",
                  birthDate ? `birth=${encodeURIComponent(birthDate)}` : "",
                  deathDate ? `death=${encodeURIComponent(deathDate)}` : "",
                  slug ? `slug=${encodeURIComponent(slug)}` : "",
                  `lang=${currentLang}`,
                ]
                  .filter(Boolean)
                  .join("&")
                  .replace(/^/, "?")}`
              )
            }
            className={primaryButtonClass}
          >
            {strings.continue}
          </button>
        </div>
      </div>
    </main>
  );
}

