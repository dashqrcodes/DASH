import HomeHeroClient from "@/components/HomeHeroClient";
import HomeLanguageToggle from "@/components/HomeLanguageToggle";

export default function HomePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <HomeHeroClient />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-start px-6 pt-24 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            DASH Memories
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight sm:text-[40px]">Life. Love. Forever.</h1>
          <p className="text-lg text-white/80">Remember Life</p>
        </div>

        <HomeLanguageToggle />
      </div>
    </main>
  );
}

