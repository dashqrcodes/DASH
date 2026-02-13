"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BackArrowButton from "@/components/BackArrowButton";

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
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);
  const lastRequestedAtRef = useRef<number>(0);
  const lastVerifyOtpRef = useRef<string>("");
  const sessionRedirectedRef = useRef(false);
  const passkeyRedirectedRef = useRef(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const nextParam = searchParams?.get("next");
  const nextUrl = nextParam && nextParam.startsWith("/") ? nextParam : "/memorial/profile";

  const pushWithFallback = (target: string) => {
    if (typeof window !== "undefined") {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current === target) return;
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  const canSend = isValidEmail(email);
  const canVerify = otp.trim().length === 6 && Boolean(sentTo);

  useEffect(() => {
    if (!nextParam) return;
    try {
      window.sessionStorage.setItem("otp_next", nextUrl);
    } catch {}
  }, [nextParam, nextUrl]);

  useEffect(() => {
    const counselorName = searchParams?.get("counselorName") || "";
    const counselorPhone = searchParams?.get("counselorPhone") || "";
    if (counselorName || counselorPhone) {
      try {
        if (counselorName) {
          window.sessionStorage.setItem("memorial_counselor_name", counselorName);
          window.localStorage.setItem("memorial_counselor_name", counselorName);
        }
        if (counselorPhone) {
          window.sessionStorage.setItem("memorial_counselor_phone", counselorPhone);
          window.localStorage.setItem("memorial_counselor_phone", counselorPhone);
        }
      } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    router.prefetch("/counselor/faceid");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionRedirectedRef.current) return;
    setIsCheckingSession(true);
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.authenticated) return;
        sessionRedirectedRef.current = true;
        if (data.userId) {
          try {
            window.localStorage.setItem("dash_user_id", data.userId);
            window.sessionStorage.setItem("dash_user_id", data.userId);
          } catch {}
        }
        if (data.email) {
          try {
            window.localStorage.setItem("dash_user_email", data.email);
            window.sessionStorage.setItem("dash_user_email", data.email);
          } catch {}
          if (!email) {
            setEmail(data.email);
          }
        }
        setStatusMessage("Welcome back.");
        pushWithFallback(nextUrl);
      })
      .catch(() => {})
      .finally(() => setIsCheckingSession(false));
  }, [email, nextUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (passkeyRedirectedRef.current) return;
    if (sessionRedirectedRef.current || isCheckingSession) return;
    const storedId =
      window.sessionStorage.getItem("dash_user_id") ||
      window.localStorage.getItem("dash_user_id");
    const storedEmail =
      window.sessionStorage.getItem("dash_user_email") ||
      window.localStorage.getItem("dash_user_email");
    if (!storedId && !storedEmail) return;
    if (!email && storedEmail) {
      setEmail(storedEmail);
    }
    setIsCheckingPasskey(true);
    fetch("/api/webauthn/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: storedId, email: storedEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.hasPasskey) return;
        passkeyRedirectedRef.current = true;
        const target = nextUrl;
        const path = `/counselor/faceid?next=${encodeURIComponent(target)}`;
        pushWithFallback(path);
      })
      .catch(() => {})
      .finally(() => setIsCheckingPasskey(false));
  }, [email, nextUrl, isCheckingSession]);

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
    const now = Date.now();
    if (now - lastRequestedAtRef.current < 15000) {
      setStatusMessage("Please wait a moment before requesting another code.");
      return;
    }
    lastRequestedAtRef.current = now;

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
      const data = await response.json().catch(() => ({}));
      if (data?.debugCode) {
        setStatusMessage(`Code sent to ${normalizedEmail}. Debug code: ${data.debugCode}`);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to send code. Please try again.");
      setIsSending(false);
      return;
    }
    setIsSending(false);

    setSentTo(normalizedEmail);
    setOtp("");
    if (!statusMessage) {
      setStatusMessage(`Code sent to ${normalizedEmail}. Check your email.`);
    }
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
      const data = await response.json().catch(() => ({}));
      if (data?.userId) {
        try {
          window.localStorage.setItem("dash_user_id", data.userId);
          window.localStorage.setItem("dash_user_email", sentTo);
        } catch {}
        try {
          window.sessionStorage.setItem("dash_user_id", data.userId);
          window.sessionStorage.setItem("dash_user_email", sentTo);
        } catch {}
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid code. Please try again.");
      setIsVerifying(false);
      return;
    }
    setIsVerifying(false);

    const target = nextUrl;
    const path = `/counselor/faceid?next=${encodeURIComponent(target)}`;
    pushWithFallback(path);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c0f1a] via-[#0b0d17] to-[#090b12] text-white">
      <BackArrowButton
        className="fixed left-4 top-4 z-50 bg-white/5 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10"
      />

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
                <div className="rounded-2xl bg-white/5 px-3 py-3 text-white/90 ring-1 ring-white/10">
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
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-center text-lg font-semibold text-white placeholder:text-white/40 focus:border-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
                    placeholder="Enter code"
                    aria-label="6-digit code"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="mt-3 text-xs text-white/70 transition hover:text-white"
                >
                  Resend code
                </button>
              </div>
            )}
            <button
              type="button"
              disabled={
                isCheckingSession ||
                isCheckingPasskey ||
                (step === "email"
                  ? !canSend || isSending
                  : !canVerify || isVerifying)
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
                ? isCheckingSession
                  ? "Checking session..."
                  : isCheckingPasskey
                    ? "Checking Face ID..."
                    : isSending
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
