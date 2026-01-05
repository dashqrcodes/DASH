"use client";

import { useRouter } from "next/navigation";

const sectionCard =
  "rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100 space-y-4";

export default function CounselorProductPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-10">
        {/* Hero video placeholder */}
        <section className={sectionCard}>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Overview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Timeless memories
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              A calm, guided experience for families—optimized for mobile counselors.
            </p>
          </div>
          <div className="aspect-video w-full rounded-2xl bg-gray-100 ring-1 ring-gray-200 shadow-inner shadow-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
            Hero video coming soon
          </div>
        </section>

        {/* What families receive */}
        <section className={sectionCard}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              Included
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              What families receive
            </h2>
          </div>

          <div className="space-y-3 text-sm text-gray-800">
            <p>• Memorial page & gallery</p>
            <p>• 100 – 4&quot;×6&quot; premium memorial cards</p>
            <p>• 1 – 20&quot;×30&quot; hero portrait</p>
            <p>• Lifetime memories</p>
            <p>• Life memories QR code</p>
            <p>• Lifetime shareable link</p>
            <p>• Up to 10 video clips &amp; 300 photos (500MB)</p>
          </div>

          <div className="flex w-full gap-4 overflow-x-auto pb-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/3] w-56 shrink-0 rounded-2xl bg-[#f3f4f6] ring-1 ring-gray-200 shadow-inner shadow-gray-100 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                Image coming soon
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

