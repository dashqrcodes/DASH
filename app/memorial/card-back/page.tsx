"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

const passages = [
  {
    text:
      "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
    credit: "-Psalm 23 (KJV)",
  },
  {
    text:
      "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
    credit: "-Matthew 11:28-29",
  },
  {
    text:
      "Blessed are those who mourn, for they shall be comforted. The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    credit: "-Matthew 5:4; Psalm 34:18",
  },
  {
    text:
      "Death is not extinguishing the light; it is only putting out the lamp because dawn has come.",
    credit: "-Rabindranath Tagore",
  },
  {
    text:
      "What we have once enjoyed we can never lose. All that we love deeply becomes a part of us.",
    credit: "-Helen Keller",
  },
  {
    text:
      "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    credit: '"-John 3:16"',
  },
];

const formatShortMonth = (value: string) => {
  if (!value) return value;
  return value.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
    (match) => {
      const normalized = match.toLowerCase();
      if (normalized === "june" || normalized === "july") return match;
      return match.slice(0, 3);
    }
  );
};

export default function MemorialCardBackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const [memorialName, setMemorialName] = useState(searchParams?.get("name") || "");
  const [birthDate, setBirthDate] = useState(searchParams?.get("birth") || "");
  const [deathDate, setDeathDate] = useState(searchParams?.get("death") || "");
  const [counselorName, setCounselorName] = useState(
    searchParams?.get("counselorName") || "Groman Mortuary"
  );
  const [counselorPhone, setCounselorPhone] = useState(
    searchParams?.get("counselorPhone") || "323-476-8005"
  );
  const [slug, setSlug] = useState(searchParams?.get("slug") || "");
  const [passageIndex, setPassageIndex] = useState(0);
  const bodyText = passages[passageIndex].text;
  const bodyCredit = passages[passageIndex].credit;
  const displayBirthDate = formatShortMonth(birthDate);
  const displayDeathDate = formatShortMonth(deathDate);

  const readStoredValue = (key: string) => {
    try {
      return window.sessionStorage.getItem(key) || window.localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const name = searchParams?.get("name") || "";
    const birth = searchParams?.get("birth") || "";
    const death = searchParams?.get("death") || "";
    const counselor = searchParams?.get("counselorName") || "";
    const phone = searchParams?.get("counselorPhone") || "";
    const slugParam = searchParams?.get("slug") || "";
    if (name) setMemorialName(name);
    if (birth) setBirthDate(birth);
    if (death) setDeathDate(death);
    if (counselor) setCounselorName(counselor);
    if (phone) setCounselorPhone(phone);
    if (slugParam) setSlug(slugParam);

    if (!name || !birth || !death || !slugParam) {
      try {
        const storedName = readStoredValue("memorial_full_name");
        const storedBirth = readStoredValue("memorial_birth_date");
        const storedDeath = readStoredValue("memorial_death_date");
        const storedSlug = readStoredValue("memorial_slug");
        if (!name && storedName) setMemorialName(storedName);
        if (!birth && storedBirth) setBirthDate(storedBirth);
        if (!death && storedDeath) setDeathDate(storedDeath);
        if (!slugParam && storedSlug) setSlug(storedSlug);
      } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    router.prefetch("/memorial/hero-preview");
  }, [router]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (memorialName) params.set("name", memorialName);
    if (birthDate) params.set("birth", birthDate);
    if (deathDate) params.set("death", deathDate);
    if (slug) params.set("slug", slug);
    params.set("lang", currentLang);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";
  const qrTargetUrl = slug ? `${appUrl}/heaven/${slug}` : "";
  const qrPreviewUrl = qrTargetUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=88-28-135&bgcolor=transparent&data=${encodeURIComponent(qrTargetUrl)}`
    : "/qr-dark-purple.svg";

  const strings =
    currentLang === "es"
      ? {
          preview: "Vista previa",
          cardLabel: 'Tarjeta 4" × 6"',
          next: "Siguiente",
          forever: "Por siempre en nuestros corazones",
          sunrise: "Amanecer",
          sunset: "Atardecer",
          honoring: "Honrando a tu ser querido con dignidad y respeto.",
        }
      : {
          preview: "Preview",
          cardLabel: '4" × 6" Card',
          next: "Next",
          forever: "Forever in Our Hearts",
          sunrise: "Sunrise",
          sunset: "Sunset",
          honoring: "Honoring your loved one with dignity and respect.",
        };

  const pushWithFallback = (target: string) => {
    router.push(target);
    if (typeof window === "undefined") return;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current === target) return;
    window.setTimeout(() => {
      window.location.assign(target);
    }, 10);
  };

  const handleApprove = () => {
    const target = `/memorial/hero-preview${buildQueryString()}`;
    pushWithFallback(target);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        onClick={() => pushWithFallback(`/memorial/card-front${buildQueryString()}`)}
      >
        ←
      </button>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-10">
        <header className="mb-8 flex flex-col items-center justify-center text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">{strings.preview}</p>
          <p className="text-sm font-semibold text-white/80">{strings.cardLabel}</p>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-[78vw] max-w-[300px] sm:max-w-[340px] md:max-w-[380px] overflow-hidden bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-[url('/sky%20background%20rear.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/55 to-white/45" />

            <div className="absolute inset-0 flex flex-col items-center justify-between px-7 py-6 text-center text-purple-900 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
              <div className="pt-2">
                <p className="text-base md:text-lg font-semibold text-purple-900 font-serif">
                  {strings.forever}
                </p>
              </div>

              <div className="flex-1 w-full flex items-center justify-center">
                <div className="space-y-2 text-xs md:text-sm leading-relaxed text-purple-900 text-center px-2">
                  <p
                    role="button"
                    tabIndex={0}
                    onClick={() => setPassageIndex((i) => (i + 1) % passages.length)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPassageIndex((i) => (i + 1) % passages.length);
                      }
                    }}
                    className="whitespace-pre-wrap outline-none cursor-pointer"
                    aria-label="Memorial text: tap to cycle passages"
                  >
                    {bodyText}
                  </p>
                  <p className="text-right text-[11px] font-semibold text-purple-900">{bodyCredit}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pb-3">
                <div className="flex w-full items-center justify-between gap-3 text-xs text-purple-800">
                  <div className="flex-1 text-center flex flex-col items-center justify-center gap-1 leading-tight">
                    <p className="text-[12px] font-semibold text-purple-900 whitespace-nowrap">{displayBirthDate}</p>
                    <p className="uppercase tracking-[0.14em] text-purple-900 font-normal whitespace-nowrap text-[10px]">
                      {strings.sunrise}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src={qrPreviewUrl}
                      alt="QR preview"
                      className="h-[18.75%] w-[18.75%] min-h-[48px] min-w-[48px] max-h-[64px] max-w-[64px] drop-shadow-[0_4px_10px_rgba(88,28,135,0.35)]"
                    />
                  </div>
                  <div className="flex-1 text-center flex flex-col items-center justify-center gap-1 leading-tight">
                    <p className="text-[12px] font-semibold text-purple-900 whitespace-nowrap">{displayDeathDate}</p>
                    <p className="uppercase tracking-[0.14em] text-purple-900 font-normal whitespace-nowrap text-[10px]">
                      {strings.sunset}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-purple-800">{strings.honoring}</p>
                <p className="text-[11px] text-purple-800 font-semibold">
                  {counselorName} • {counselorPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-6 pt-6">
        <div className="space-y-3">
          <button type="button" onClick={handleApprove} className={primaryButtonClass}>
            {strings.next}
          </button>
        </div>
      </div>
    </main>
  );
}
