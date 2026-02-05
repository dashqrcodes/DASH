"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-300";

const cardClass = "rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100 space-y-4";

export default function MemorialPrintsPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(100);
  const [addons, setAddons] = useState({
    extraCards: false,
    heroPortrait: false,
    extraQr: false,
    acrylic: false,
  });

  const toggleAddon = (key: keyof typeof addons) =>
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-28 pt-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Choose your keepsakes</h1>
          <p className="text-base leading-relaxed text-gray-600">
            Printed with care. Delivered before the service.
          </p>
        </header>

        <div className="space-y-6">
          {/* Section 1: Required */}
          <section className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">4&quot;x6&quot; Memorial Cards</p>
                <p className="text-xs text-gray-500">Required</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => changeQuantity(-100)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-gray-900 ring-1 ring-gray-200 shadow-sm transition hover:bg-gray-50"
                >
                  –
                </button>
                <div className="min-w-[64px] text-center text-base font-semibold text-gray-900">
                  {quantity}
                </div>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => changeQuantity(100)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-gray-900 ring-1 ring-gray-200 shadow-sm transition hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Most families choose 100–200 cards</p>
          </section>

          {/* Section 2: Included */}
          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Included</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Memorial page & gallery</p>
              <p>• Lifetime QR code</p>
              <p>• Lifetime shareable link</p>
              <p>• Slideshow access</p>
            </div>
          </section>

          {/* Section 3: Optional add-ons */}
          <section className={cardClass}>
            <p className="text-sm font-semibold text-gray-900">Optional add-ons</p>
            <div className="space-y-3">
              {[
                { key: "extraCards", label: "Additional 100 memorial cards" },
                { key: "heroPortrait", label: '20"x30" mounted hero portrait' },
                { key: "extraQr", label: "Extra QR exports (headstone, urn, plaque)" },
                { key: "acrylic", label: "Acrylic keepsake", badge: "Popular" },
              ].map((item) => {
                const active = addons[item.key as keyof typeof addons];
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-inner shadow-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          active ? "border-gray-900 bg-gray-900" : "border-gray-300"
                        } transition`}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAddon(item.key as keyof typeof addons)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        active ? "bg-gray-900" : "bg-gray-200"
                      }`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          active ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 px-6 pb-6 pt-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.push("/memorial/delivery")}
          className={primaryButtonClass}
        >
          Continue
        </button>
      </div>
    </main>
  );
}



