'use client';

export default function Profile() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Profile (Placeholder)</h1>
        <p className="text-base text-white/80">
          This page is ready to be connected to Supabase. Local storage and mock video logic have
          been removed. Add your Supabase fetch/save logic here when ready.
        </p>
      </div>
    </main>
  );
}
