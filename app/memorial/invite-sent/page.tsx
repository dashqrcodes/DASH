"use client";

import { useRouter } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 focus:outline-none focus:ring-2 focus:ring-gray-300";

export default function InviteSentPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12">
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Invitation sent</h1>
          <p className="text-base leading-relaxed text-gray-600">
            The family can now continue honoring their loved one.
          </p>
        </header>

        <section className="flex flex-1 flex-col gap-8">
          <div className="space-y-3 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-700">Link sent to client</p>
            <div className="rounded-2xl bg-white px-4 py-3 text-sm font-mono text-gray-900 shadow-inner shadow-gray-100 ring-1 ring-gray-100">
              https://dashmemories.com/family/maria-trujillo
            </div>
            <p className="text-sm text-gray-500">
              The family can now start sharing the link with friends and family to add photos, video
              clips, and complete their print shop order.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => router.push("/counselor")}
              className={primaryButtonClass}
            >
              Help a new client
            </button>
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:text-gray-900"
            >
              Copy link
            </button>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-gray-500">
          DASH Memories, Inc. • Groman
        </footer>
      </div>
    </main>
  );
}

