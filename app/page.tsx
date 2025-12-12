'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans dark:from-black dark:to-zinc-900">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-8 py-16 sm:px-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
              DASH
            </h1>
            <p className="text-xl font-medium text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              Beautiful Memorial Products
            </p>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Create beautiful memorial cards, posters, and digital tributes with QR codes. 
              Professional tools for funeral homes and families.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => router.push('/product-hub')}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg sm:w-auto"
            >
              Start Creating
            </button>
            <button
              onClick={() => router.push('/memorial-card-builder')}
              className="flex h-14 w-full items-center justify-center rounded-full border-2 border-zinc-300 bg-white px-8 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 sm:w-auto"
            >
              Memorial Card Builder
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
              <div className="text-3xl">📋</div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Memorial Cards</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">4"×6" cards with QR codes</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
              <div className="text-3xl">🖼️</div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Posters</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">20"×30" memorial posters</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
              <div className="text-3xl">📱</div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Digital Tributes</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Slideshows and memories</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
