"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Province, type Sector } from "@/lib/api";

export default function ExplorePage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Record<string, { code: string; name: string }[]>>({});

  useEffect(() => {
    Promise.all([api.getProvinces(), api.getSectors(), api.getRegions()])
      .then(([p, s, r]) => { setProvinces(p); setSectors(s); setRegions(r); })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Jelajahi Ekonomi Indonesia</h1>
      <p className="text-muted-foreground mb-8">
        Eksplorasi data ekonomi per provinsi, sektor, dan wilayah berdasarkan model IRIO Indonesia.
      </p>

      {/* Provinces by Region */}
      <h2 className="text-xl font-semibold mb-4">Provinsi</h2>
      <div className="space-y-6 mb-12">
        {Object.entries(regions).map(([regionName, provs]) => (
          <div key={regionName}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {regionName}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {provs.map((p) => (
                <Link key={p.code} href={`/explore/provinces/${p.code}`}>
                  <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.code}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sectors */}
      <h2 className="text-xl font-semibold mb-4">Lapangan Usaha</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-12">
        {sectors.map((s) => (
          <Link key={s.code} href={`/explore/sectors/${s.code}`}>
            <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1e3a5f] text-white text-xs font-bold">
                    {s.code}
                  </span>
                  <p className="text-sm font-medium leading-tight">{s.name}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/explore/regions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">Analisis Regional</h3>
              <p className="text-sm text-muted-foreground mt-1">Sumatera, Jawa, Kalimantan, dll.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/linkages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">Forward & Backward Linkage</h3>
              <p className="text-sm text-muted-foreground mt-1">Scatterplot klasifikasi sektor</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/linkages/bilateral">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">Keterkaitan Bilateral</h3>
              <p className="text-sm text-muted-foreground mt-1">Heatmap 34×34 provinsi</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
