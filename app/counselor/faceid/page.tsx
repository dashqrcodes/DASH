"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";
import { useEffect, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function CounselorFaceIdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const nextParam = searchParams?.get("next");
  const nextUrl = nextParam && nextParam.startsWith("/") ? nextParam : "/memorial/profile";
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedId =
        window.sessionStorage.getItem("dash_user_id") ||
        window.localStorage.getItem("dash_user_id");
      const storedEmail =
        window.sessionStorage.getItem("dash_user_email") ||
        window.localStorage.getItem("dash_user_email");
      if (storedId) setUserId(storedId);
      if (storedEmail) setUserEmail(storedEmail);
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId && !userEmail) return;
    fetch("/api/webauthn/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email: userEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        setHasPasskey(Boolean(data?.hasPasskey));
        setPasskeyCount(Number(data?.count || 0));
      })
      .catch(() => {});
  }, [userId, userEmail]);

  useEffect(() => {
    if (!hasPasskey || isAuthenticating) return;
    if (!isSupported) return;
    if (!userId && !userEmail) return;
    handleAuthenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPasskey, isSupported, userId, userEmail]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
      return;
    }
    void window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => setIsSupported(available))
      .catch(() => setIsSupported(true));
  }, []);

  const handleEnroll = async () => {
    if (!isSupported) {
      setErrorMessage("Face ID is not supported on this device.");
      return;
    }
    if (!userId && !userEmail) {
      setErrorMessage("Missing account info. Please sign in again.");
      return;
    }
    setErrorMessage(null);
    setStatusMessage(null);
    setIsEnrolling(true);
    try {
      const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      const optionsData = await optionsRes.json().catch(() => ({}));
      if (!optionsRes.ok) {
        throw new Error(optionsData?.error || "Unable to start Face ID.");
      }

      const attestation = await startRegistration(optionsData.options);
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: optionsData.userId || userId, response: attestation }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        throw new Error(verifyData?.error || "Unable to verify Face ID.");
      }
      setStatusMessage("Face ID enabled.");
      setHasPasskey(true);
      setPasskeyCount((count) => count + 1);
      router.push(nextUrl);
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to enable Face ID.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!isSupported) {
      setErrorMessage("Face ID is not supported on this device.");
      return;
    }
    if (!userId && !userEmail) {
      setErrorMessage("Missing account info. Please sign in again.");
      return;
    }
    setErrorMessage(null);
    setStatusMessage(null);
    setIsAuthenticating(true);
    try {
      const optionsRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      const optionsData = await optionsRes.json().catch(() => ({}));
      if (!optionsRes.ok) {
        throw new Error(optionsData?.error || "Unable to start Face ID.");
      }

      const assertion = await startAuthentication(optionsData.options);
      const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: optionsData.userId || userId, response: assertion }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        throw new Error(verifyData?.error || "Unable to verify Face ID.");
      }
      setStatusMessage("Verified.");
      router.push(nextUrl);
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to verify Face ID.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-white text-gray-900">
      <BackArrowButton
        variant="light"
        className="fixed left-4 top-4 z-50"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-8 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-10 pt-14 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Quick Easy Access
          </h1>
        </div>

        <div className="mt-8 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={hasPasskey ? handleAuthenticate : handleEnroll}
            className={primaryButtonClass + " w-full"}
            disabled={hasPasskey ? isAuthenticating : isEnrolling}
          >
            {hasPasskey
              ? isAuthenticating
                ? "Verifying..."
                : "Use Face ID to Continue"
              : isEnrolling
                ? "Enabling Face ID..."
                : "Enable Face ID"}
          </button>
          {(statusMessage || errorMessage) && (
            <div className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              {errorMessage ? (
                <span className="text-rose-600">{errorMessage}</span>
              ) : (
                statusMessage
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push(nextUrl)}
            className="mt-8 w-full text-center text-xs font-medium text-gray-500 underline underline-offset-4 pb-1"
          >
            Skip for now, I'll manually input credentials.
          </button>
        </div>
      </div>
    </main>
  );
}

