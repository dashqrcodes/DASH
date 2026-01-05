"use client";

import { useRouter, useSearchParams } from "next/navigation";

const approveButtonClass =
  "h-12 px-6 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-green-300/60";

const changeButtonClass =
  "h-12 px-6 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(244,63,94,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-rose-200/60";

export default function FinalApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const birth = searchParams.get("birth");
  const death = searchParams.get("death");
  const slug = searchParams.get("slug");

  const buildParams = () => {
    const parts = [
      name ? `name=${encodeURIComponent(name)}` : "",
      birth ? `birth=${encodeURIComponent(birth)}` : "",
      death ? `death=${encodeURIComponent(death)}` : "",
      slug ? `slug=${encodeURIComponent(slug)}` : "",
    ].filter(Boolean);
    return parts.length ? `?${parts.join("&")}` : "";
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-16 pt-16 text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Final approval</h1>
          <p className="text-base text-white/80">
            Review your order before approving. After approval, print orders are final.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            className={changeButtonClass + " w-full"}
            onClick={() => router.back()}
          >
            Change
          </button>
          <button
            type="button"
            className={approveButtonClass + " w-full"}
            onClick={() => router.push(`/order/success${buildParams()}`)}
          >
            Approve
          </button>
        </div>
      </div>
    </main>
  );
}

