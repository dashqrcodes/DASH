import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteTransition from "./route-transition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DASH - Beautiful Memorial Products",
  description: "Create beautiful memorial cards, posters, and digital tributes with QR codes. Professional tools for funeral homes and families.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
