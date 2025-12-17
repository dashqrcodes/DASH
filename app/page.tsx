// Redirect root to /gift so visitors land directly on the main flow.

export const dynamic = 'force-dynamic';

export default function HomeRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/gift');
    return null;
  }

  // SSR fallback meta refresh
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0; url=/gift" />
      </head>
      <body>
        <p>Redirecting to /gift…</p>
      </body>
    </html>
  );
}
