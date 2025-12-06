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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
