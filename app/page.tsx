import Link from "next/link";
import HomeHeroClient from "@/components/HomeHeroClient";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <HomeHeroClient />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            DASH Memories
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight sm:text-[40px]">Life. Love. Forever.</h1>
          <p className="text-lg text-white/80">Remember Life</p>
        </div>

        {/* Toggle moved below headline */}
        <div className="mt-8 flex items-center justify-center">
          <div className="relative flex items-center rounded-full bg-white/10 px-1 py-1 ring-1 ring-white/15 backdrop-blur">
            <div
              className="absolute inset-y-1 w-1/2 translate-x-full rounded-full bg-white shadow-lg"
            />
            <Link
              href="/start"
              className="relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold text-white/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 hover:text-white"
            >
              Mortuary
            </Link>
            <Link
              href="/memorial/profile"
              className="relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold text-gray-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Family
            </Link>
          </div>
        </div>

        {/* CTAs removed per request */}
      </div>
    </main>
  );
}

