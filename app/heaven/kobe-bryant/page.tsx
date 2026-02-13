import VideoTribute from "@/components/VideoTribute";

// Dedicated route for /heaven/kobe-bryant - no Supabase, no DB, no env vars.
// Always works regardless of backend config.
const KOBE_PLAYBACK_ID = "BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624";

export const revalidate = 0;

export default function KobeBryantPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-20 pt-10 md:px-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-300">
            Timeless Transparency Tribute
          </p>
          <h1 className="text-4xl font-semibold text-slate-50 md:text-5xl">
            Kobe Bryant
          </h1>
        </header>

        <VideoTribute playbackId={KOBE_PLAYBACK_ID} poster={null} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-50">Moments</h2>
          <p className="text-slate-400">No moments have been added yet. Check back soon.</p>
        </section>
      </div>
    </main>
  );
}
