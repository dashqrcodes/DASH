"use client";

import { useRouter } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 focus:outline-none focus:ring-2 focus:ring-gray-300";

const cardClass =
  "rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100 space-y-3";

export default function MemorialStartPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12">
        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              We’ll take this one step at a time.
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              You don’t need everything right now.
              <br />
              We’ll start with what’s needed for printing.
            </p>
          </div>

          <section className={cardClass}>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              What you’ll do first
            </p>
            <div className="space-y-2 text-sm text-gray-800">
              <p>• Add loved one’s name & dates</p>
              <p>• Upload one photo for print</p>
              <p>• Preview memorial cards & portrait</p>
              <p>• Approve for printing</p>
            </div>
          </section>

        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push("/memorial/details")}
            className={primaryButtonClass}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}

