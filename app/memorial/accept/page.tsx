"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const formatPhone = (value: string) => {
  const digits = normalizePhone(value).slice(0, 10);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);
  return [part1, part2, part3].filter(Boolean).join("-");
};

export default function MemorialAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const counselorName = searchParams?.get("counselor") || "Your counselor";
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const canVerify = normalizePhone(phone).length === 10 && otp.trim().length === 6;

  useEffect(() => {
    if (canVerify) {
      router.push("/memorial/checkout");
    }
  }, [canVerify, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c0f1a] via-[#0b0d17] to-[#090b12] text-white">
      {/* Floating stars placeholder */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" />

      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        onClick={() => router.back()}
      >
        ←
      </button>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-20 pt-20">
        <div className="space-y-8 text-center">
          <p className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#0b1a3a] via-purple-500 via-[#0b1a3a] via-[#1f2b5a] to-purple-700 bg-clip-text text-transparent gradient-anim">
            DASH
          </p>
          <p className="text-2xl font-semibold text-white/85">Life. Love. Forever.</p>
          <p className="text-base leading-relaxed text-white/80">Accept Groman invite</p>

          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Mobile phone</label>
              <div className="rounded-full p-[3px] bg-gradient-to-r from-purple-600 via-[#c43a3a] via-purple-500 to-purple-700 shadow-[0_0_22px_rgba(79,70,229,0.45)] gradient-anim">
                <div className="relative overflow-hidden rounded-full bg-gradient-to-b from-[#0c0f1a] via-[#0b0d17] to-[#090b12]">
                  <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="e.g.323-555-0199"
                    className="relative z-10 h-12 w-full rounded-full border border-transparent bg-transparent px-4 text-base text-white text-center placeholder:text-white/40 shadow-inner shadow-black/30 focus:border-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Verification code (OTP)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="• • • • • •"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-center text-lg tracking-[0.6em] text-white placeholder:text-white/30 shadow-inner shadow-black/20 focus:border-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
              />
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-40px);
            opacity: 0;
          }
        }
        .animate-float-slow {
          animation-name: float-slow;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
      <style jsx>{`
        .gradient-anim {
          background-size: 200% 200%;
          animation: dash-gradient 6s ease infinite;
        }
        @keyframes dash-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}
