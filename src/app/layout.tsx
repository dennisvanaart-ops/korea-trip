import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TRIP_TITLE } from "@/data/trip";

export const metadata: Metadata = {
  title: TRIP_TITLE,
  description: "Zuid-Korea rondreis 28 april – 12 mei 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl min-h-screen">{children}</div>
      </body>
    </html>
  );
}
