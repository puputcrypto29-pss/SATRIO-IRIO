import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SATRIO — Sistem Analisis Transaksi Regional Input-Output",
  description:
    "Platform Analisis IRIO Indonesia untuk Keterkaitan Sektoral, Antarwilayah, Multiplier, dan Simulasi Dampak Ekonomi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
