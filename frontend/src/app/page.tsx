"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Summary } from "@/lib/api";

const useCases = [
  {
    question: "Apa dampaknya jika aktivitas pariwisata di Bali menurun?",
    description: "Simulasikan penurunan sektor akomodasi di Bali dan lihat propagasi dampaknya ke seluruh Indonesia.",
  },
  {
    question: "Provinsi mana yang paling bergantung pada Jawa Timur?",
    description: "Jelajahi keterkaitan bilateral antarprovinsi berdasarkan matriks Leontief.",
  },
  {
    question: "Sektor mana yang memiliki backward linkage terkuat?",
    description: "Analisis keterkaitan ke belakang dan ke depan untuk menemukan sektor kunci ekonomi.",
  },
  {
    question: "Bagaimana shock ekonomi menyebar ke seluruh Indonesia?",
    description: "Visualisasikan transmisi dampak antarwilayah melalui peta dan diagram alir.",
  },
  {
    question: "Sektor apa yang menjadi hub strategis ekonomi?",
    description: "Identifikasi Key Sectors dengan BL dan FL di atas rata-rata nasional.",
  },
];

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e40af] text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            {Array.from({ length: 34 }, (_, i) => {
              const x = 50 + (i % 8) * 90 + Math.sin(i) * 20;
              const y = 60 + Math.floor(i / 8) * 80 + Math.cos(i) * 15;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="currentColor" opacity="0.6" />
                  {i > 0 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={50 + ((i - 1) % 8) * 90 + Math.sin(i - 1) * 20}
                      y2={60 + Math.floor((i - 1) / 8) * 80 + Math.cos(i - 1) * 15}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm mb-6">
              <span className="text-blue-200">SATRIO</span>
              <span className="text-white/60">|</span>
              <span className="text-white/80">Sistem Analisis Transaksi Regional Input-Output</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Pahami Bagaimana Ekonomi Indonesia{" "}
              <span className="text-blue-300">Saling Terhubung</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/80 leading-relaxed max-w-2xl">
              Simulasikan shock ekonomi regional dan temukan bagaimana dampaknya
              menyebar antarprovinsi dan antarsektor menggunakan kerangka
              Inter-Regional Input-Output Indonesia.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/simulator">
                <Button
                  size="lg"
                  className="bg-white text-[#1e3a5f] hover:bg-blue-50 font-semibold px-8"
                >
                  Mulai Simulasi
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8"
                >
                  Jelajahi Indonesia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { value: String(summary?.province_count ?? 34), label: "Provinsi" },
              { value: String(summary?.sector_count ?? 17), label: "Lapangan Usaha" },
              { value: String(summary?.province_sector_count ?? 578), label: "Node Provinsi-Sektor" },
              { value: "334.084", label: "Interaksi Ekonomi" },
              { value: "IRIO", label: "Model Leontief" },
            ].map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#1e3a5f] dark:text-blue-400">
                  {metric.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Apa yang Bisa Dijawab SATRIO?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Platform ini membantu Anda menjawab pertanyaan-pertanyaan penting
              tentang keterkaitan ekonomi antarwilayah Indonesia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <Card
                key={i}
                className="hover:shadow-md transition-shadow border-border/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold">
                      ?
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm leading-snug">
                        {uc.question}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {uc.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Cara Menggunakan
          </h2>
          <div className="grid md:grid-cols-5 gap-4 md:gap-2">
            {[
              { step: "1", title: "Pilih", desc: "Tentukan provinsi dan sektor ekonomi" },
              { step: "2", title: "Simulasikan", desc: "Masukkan nilai shock dan jalankan" },
              { step: "3", title: "Pahami", desc: "Lihat dampak lokal dan spillover" },
              { step: "4", title: "Jelajahi", desc: "Eksplorasi peta dan grafik dampak" },
              { step: "5", title: "Unduh", desc: "Download hasil analisis lengkap" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-white font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/simulator">
              <Button
                size="lg"
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-8"
              >
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
