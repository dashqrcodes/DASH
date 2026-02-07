"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function MemorialExperiencePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c0f1a] via-[#0b0d17] to-[#090b12] text-white">
      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        onClick={() => router.back()}
      >
        ←
      </button>
      {/* Angled photo grid removed for cleaner background */}

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-28 pt-24 text-center">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Payment success</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Let’s begin creating.</h1>
          <p className="text-base md:text-lg text-white/85">
            We’ll guide you step by step.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-28 pt-6">
        <div className="mx-auto flex w-full max-w-md justify-center">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => router.push("/memorial/profile")}
          >
            Create the DASH
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes drift-slow {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -20px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-drift-slow {
          animation: drift-slow 16s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

