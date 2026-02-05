"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300/60";

const cardClass =
  "rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 space-y-4";

export default function MemorialCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const memorialName = searchParams?.get("name") || "";
  const birth = searchParams?.get("birth") || "";
  const death = searchParams?.get("death") || "";
  const slug = searchParams?.get("slug") || "";

  const strings =
    currentLang === "es"
      ? {
          title: "Revisar y confirmar",
          packageLabel: "Paquete memorial",
          subtotal: "Subtotal",
          tax: "Impuesto (CA 9.5%)",
          total: "Total",
          payNow: "Pagar ahora",
          delivery: "Ubicación de entrega: Groman Mortuary",
          items: [
            '• 50 tarjetas memorial (4"×6")',
            '• 1 retrato heroico (20"×30")',
            "• Perfil y slideshow de por vida",
            "• Código QR y enlace de por vida",
          ],
        }
      : {
          title: "Review & confirm",
          packageLabel: "Memorial Package",
          subtotal: "Subtotal",
          tax: "Sales tax (CA 9.5%)",
          total: "Total",
          payNow: "Pay now",
          delivery: "Delivery location: Groman Mortuary",
          items: [
            '• 50 memorial cards (4"x6")',
            '• 1 hero portrait (20"x30")',
            "• Lifetime profile & slideshow",
            "• Life QR code & forever link",
          ],
        };

  const handleCheckout = async () => {
    let photoUrl = "";
    try {
      photoUrl =
        window.sessionStorage.getItem("memorial_photo_url") ||
        window.localStorage.getItem("memorial_photo_url") ||
        "";
    } catch {}

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: slug || "memorial-id-missing",
          slug,
          photoUrl,
          name: memorialName,
          birth,
          death,
          lang: currentLang,
        }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      // Intentionally silent; keep UX minimal for now.
      console.error("Checkout failed", error);
    }
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
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-16">
        <header className="mb-8 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{strings.title}</h1>
        </header>

        <section className="space-y-6">
          <div className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">{strings.packageLabel}</p>
            <div className="space-y-2 text-sm text-gray-700">
              {strings.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <p>{strings.subtotal}</p>
              <p className="font-semibold">$250.00</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <p>{strings.tax}</p>
              <p className="font-semibold">$23.75</p>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-900 pt-2">
              <p>{strings.total}</p>
              <p>$273.75</p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={handleCheckout}
          >
            {strings.payNow}
          </button>
          <p className="mt-3 text-center text-xs text-gray-600">{strings.delivery}</p>
        </div>
      </div>
    </main>
  );
}



