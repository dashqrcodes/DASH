"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export default function MemorialAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastRequestedRef = useRef<string>("");
  const lastVerifyOtpRef = useRef<string>("");
  const [step, setStep] = useState<"email" | "code">("email");
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const otpSlots = Array.from({ length: 6 });

  const nextParam = searchParams?.get("next");
  const nextUrl = nextParam && nextParam.startsWith("/") ? nextParam : "/memorial/profile";

  const canSend = isValidEmail(email);
  const canVerify = otp.trim().length === 6 && Boolean(sentTo);

  useEffect(() => {
    if (!nextParam) return;
    try {
      window.sessionStorage.setItem("otp_next", nextUrl);
    } catch {}
  }, [nextParam, nextUrl]);

  useEffect(() => {
    if (!canVerify || isVerifying) return;
    const token = otp.trim();
    if (token.length !== 6) return;
    if (lastVerifyOtpRef.current === token) return;
    lastVerifyOtpRef.current = token;
    handleVerifyCode();
  }, [canVerify, isVerifying, otp, sentTo]);

  useEffect(() => {
    if (step === "code") {
      otpInputRef.current?.focus();
    }
  }, [step]);

  const handleSendCode = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!canSend) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (lastRequestedRef.current === normalizedEmail) return;
    lastRequestedRef.current = normalizedEmail;

    setIsSending(true);
    try {
      const response = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to send code. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to send code. Please try again.");
      setIsSending(false);
      return;
    }
    setIsSending(false);

    setSentTo(normalizedEmail);
    setOtp("");
    setStatusMessage(`Code sent to ${normalizedEmail}. Check your email.`);
    setStep("code");
  };

  const handleVerifyCode = async () => {
    if (!sentTo) {
      setErrorMessage("Send the code first.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo, code: otp.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Invalid code. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid code. Please try again.");
      setIsVerifying(false);
      return;
    }
    setIsVerifying(false);

    const target = nextUrl;
    router.push(`/counselor/faceid?next=${encodeURIComponent(target)}`);
  };

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
          <p className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent gradient-anim">
            DASH
          </p>
          <p className="text-2xl font-semibold text-white/85">Life. Love. Forever.</p>
          <p className="text-base leading-relaxed text-white/80">
            {step === "email" ? "Enter your email to continue" : "Enter the 6-digit code"}
          </p>

          <div className="space-y-5 text-center">
            <div className="rounded-full p-[3px] bg-gradient-to-r from-purple-600 via-[#c43a3a] via-purple-500 to-purple-700 shadow-[0_0_22px_rgba(79,70,229,0.45)] gradient-anim">
              <div className="relative overflow-hidden rounded-full bg-gradient-to-b from-[#0c0f1a] via-[#0b0d17] to-[#090b12]">
                <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="relative z-10 h-12 w-full rounded-full border border-transparent bg-transparent px-4 text-base text-white text-center placeholder:text-white/40 shadow-inner shadow-black/30 focus:border-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
                />
              </div>
            </div>
            {step === "code" && (
              <div className="space-y-2">
                <div className="text-xs text-white/60">6-digit code</div>
                <label
                  htmlFor="otp-code-input"
                  className="relative flex items-center justify-between gap-2 rounded-2xl bg-white/5 px-3 py-3 text-white/90 ring-1 ring-white/10"
                >
                  <input
                    id="otp-code-input"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => {
                      const nextValue = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(nextValue);
                    }}
                    className="absolute inset-0 h-full w-full opacity-0"
                    aria-label="6-digit code"
                  />
                  {otpSlots.map((_, index) => (
                    <div
                      key={`otp-slot-${index}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/30 text-lg font-semibold text-white ring-1 ring-white/10"
                    >
                      {otp[index] ?? ""}
                    </div>
                  ))}
                </label>
              </div>
            )}
            <button
              type="button"
              disabled={
                step === "email" ? !canSend || isSending : !canVerify || isVerifying
              }
              onClick={() => {
                if (step === "email") {
                  handleSendCode();
                } else {
                  handleVerifyCode();
                }
              }}
              className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 transition active:scale-95 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === "email"
                ? isSending
                  ? "Sending code..."
                  : "Send code"
                : isVerifying
                  ? "Verifying..."
                  : "Verify code"}
            </button>
            {(statusMessage || errorMessage) && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                {errorMessage ? <span className="text-rose-300">{errorMessage}</span> : statusMessage}
              </div>
            )}
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
          background-image: linear-gradient(
            120deg,
            #0b1a3a,
            #4c1d95,
            #8b5cf6,
            #ef4444,
            #f97316,
            #f8fafc
          );
          background-size: 300% 300%;
          animation: dash-gradient 8s ease infinite;
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
