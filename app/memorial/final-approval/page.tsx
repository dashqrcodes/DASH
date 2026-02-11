"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveLang } from "@/lib/utils/lang";

const approveButtonClass =
  "h-12 px-6 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300/60";

const changeButtonClass =
  "h-12 px-6 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(244,63,94,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-200/60";

export default function FinalApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const name = searchParams?.get("name");
  const birth = searchParams?.get("birth");
  const death = searchParams?.get("death");
  const slug = searchParams?.get("slug");
  const photo = searchParams?.get("photo");
  const [isSaving, setIsSaving] = useState(false);

  const getStoredValue = (key: string) => {
    try {
      return window.sessionStorage.getItem(key) || window.localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  };

  const effectiveName = name || getStoredValue("memorial_full_name");
  const effectiveBirth = birth || getStoredValue("memorial_birth_date");
  const effectiveDeath = death || getStoredValue("memorial_death_date");
  const effectiveSlug = slug || getStoredValue("memorial_slug");
  const printBaseUrl = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl) return "";
    return `${supabaseUrl}/storage/v1/object/public/prints`;
  }, []);

  const cardPdfUrl = effectiveSlug ? `${printBaseUrl}/${effectiveSlug}.pdf` : "";
  const posterPdfUrl = effectiveSlug ? `${printBaseUrl}/${effectiveSlug}-poster.pdf` : "";

  useEffect(() => {
    router.prefetch("/memorial/order/success");
  }, [router]);

  useEffect(() => {
    router.prefetch("/memorial/accept");
  }, [router]);

  const buildParams = () => {
    const parts = [
      effectiveSlug ? `slug=${encodeURIComponent(effectiveSlug)}` : "",
      `lang=${currentLang}`,
    ].filter(Boolean);
    return parts.length ? `?${parts.join("&")}` : "";
  };

  const strings =
    currentLang === "es"
      ? {
          title: "Aprobación final",
          body: "Revisa tu pedido antes de aprobar. Después de la aprobación, las impresiones son finales.",
          change: "Cambiar",
          approve: "Aprobar",
          saving: "Guardando...",
        }
      : {
          title: "Final approval",
          body: "Review your order before approving. After approval, print orders are final.",
          change: "Change",
          approve: "Approve",
          saving: "Saving...",
        };

  const pushWithFallback = (target: string) => {
    if (typeof window !== "undefined") {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current === target) return;
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  const handleApprove = () => {
    setIsSaving(true);

    const effectivePhoto = photo || getStoredValue("memorial_photo_url");
    const qrUrl = effectiveSlug
      ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=88-28-135&bgcolor=transparent&data=${encodeURIComponent(
          `https://dashmemories.com/heaven/${effectiveSlug}`
        )}`
      : "";

    if (effectiveSlug && effectivePhoto && qrUrl) {
      void fetch("/api/generate-print-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: effectiveSlug,
          photoUrl: effectivePhoto,
          qrUrl,
          format: "card",
        }),
      }).catch(() => {
        // Ignore; PDF generation should not block navigation.
      });

      void fetch("/api/generate-print-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: effectiveSlug,
          photoUrl: effectivePhoto,
          qrUrl,
          format: "poster",
        }),
      }).catch(() => {
        // Ignore; PDF generation should not block navigation.
      });
    }

    const nextUrl = `/memorial/order/success${buildParams()}`;
    pushWithFallback(`/memorial/accept?next=${encodeURIComponent(nextUrl)}`);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-16 pt-16 text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{strings.title}</h1>
          <p className="text-base text-white/80">{strings.body}</p>
        </div>

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            className={changeButtonClass + " w-full"}
            onClick={() => pushWithFallback(`/memorial/hero-preview${buildParams()}`)}
          >
            {strings.change}
          </button>
          <button
            type="button"
            className={approveButtonClass + " w-full"}
            onClick={handleApprove}
          >
            {isSaving ? strings.saving : strings.approve}
          </button>
        </div>

        {effectiveSlug && printBaseUrl && (
          <div className="mt-6 w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left">
            <p className="text-sm font-semibold text-white">Print PDF previews</p>
            <p className="mt-1 text-xs text-white/60">
              These previews contain the live, working QR code for `heaven/{effectiveSlug}`.
            </p>
            <div className="mt-4 flex w-full flex-col gap-3">
              <a
                href={cardPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15"
              >
                4x6 Card Back PDF
                <span className="text-xs text-white/60">Open</span>
              </a>
              <a
                href={posterPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15"
              >
                20x30 Hero Poster PDF
                <span className="text-xs text-white/60">Open</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

