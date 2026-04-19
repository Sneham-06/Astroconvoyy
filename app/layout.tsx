import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraConvoy - AI Defence Transport & Threat Intelligence System",
  description: "AI-Powered Military Convoy Management System for Indian Army - Route Optimization, Threat Prediction & Real-Time Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin=""></script>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
