// Root Layout for TikTok Gift Funnel
// Isolated to /gift-build folder

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeless Transparency Gift | Dash Memories',
  description: 'Create a timeless memory with photo, video, and QR code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


