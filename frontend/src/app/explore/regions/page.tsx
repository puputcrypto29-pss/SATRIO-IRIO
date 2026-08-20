"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type RegionLinkage } from "@/lib/api";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function RegionsPage() {
  const [data, setData] = useState<RegionLinkage[]>([]);

  useEffect(() => {
    api.getLinkagesRegions().then(setData).catch(() => {});
  }, []);

  const chartOption = data.length > 0 ? {
    tooltip: { trigger: "axis" as const },
    legend: { data: ["Intra-Regional", "Inter-Regional"] },
    grid: { left: 120, right: 20, top: 40, bottom: 30 },
    xAxis: { type: "value" as const },
    yAxis: { type: "category" as const, data: data.map((r) => r.region) },
    series: [
      { name: "Intra-Regional", type: "bar" as const, stack: "total", data: data.map((r) => r.intra_regional), itemStyle: { color: "#1e3a5f" } },
      { name: "Inter-Regional", type: "bar" as const, stack: "total", data: data.map((r) => r.inter_regional_bl), itemStyle: { color: "#60a5fa" } },
    ],
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Analisis Regional</h1>
      <p className="text-muted-foreground mb-8">
        Keterkaitan ekonomi per wilayah: Sumatera, Jawa, Bali-Nusa Tenggara, Kalimantan, Sulawesi, Maluku-Papua.
      </p>

      {chartOption && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="text-base">Keterkaitan Intra vs Inter-Regional</CardTitle></CardHeader>
          <CardContent><EChartsReact option={chartOption} style={{ height: 300 }} /></CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Wilayah</th>
              <th className="py-2 pr-4 text-right">Provinsi</th>
              <th className="py-2 pr-4 text-right">BL Index</th>
              <th className="py-2 pr-4 text-right">FL Index</th>
              <th className="py-2 pr-4 text-right">Intra (%)</th>
              <th className="py-2 pr-4 text-right">PDRB (T Rp)</th>
              <th className="py-2">Klasifikasi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.region} className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">{r.region}</td>
                <td className="py-2 pr-4 text-right">{r.province_count}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{r.bl_index.toFixed(3)}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{r.fl_index.toFixed(3)}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{r.share_intra_bl_pct.toFixed(1)}%</td>
                <td className="py-2 pr-4 text-right tabular-nums">{r.pdrb_triliun_rp.toFixed(1)}</td>
                <td className="py-2"><Badge variant="secondary" className="text-xs">{r.classification}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
