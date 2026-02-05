export default function FamilyCreatePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12">
        <header className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
            Dash
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-900">Family memorial</p>
            <p className="text-xs text-gray-500">Counselor setup</p>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Start a family memorial</h1>
            <p className="text-base leading-relaxed text-gray-600">
              Capture the core details to begin.
            </p>
          </div>

          <form className="mt-8 space-y-5 rounded-3xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Family contact name</label>
              <input
                required
                type="text"
                placeholder="e.g. Maria Lopez"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Family mobile number</label>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="e.g. 323-555-0199"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Deceased full name</label>
              <input
                required
                type="text"
                placeholder="e.g. Alejandro Ramirez"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </form>

          <div className="mt-auto pt-10">
            <button
              type="button"
              className="h-12 w-full rounded-full bg-gray-900 text-base font-semibold text-white shadow-lg shadow-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/90 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

