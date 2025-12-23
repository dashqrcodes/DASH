// Route moved to app/api/drafts/create/route.ts
export async function POST() {
  return new Response(
    JSON.stringify({ error: 'Use /api/drafts/create instead.' }),
    { status: 410 },
  );
}

