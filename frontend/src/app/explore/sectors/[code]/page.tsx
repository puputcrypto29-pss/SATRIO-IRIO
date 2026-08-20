"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

type SectorDetail = Awaited<ReturnType<typeof api.getSectorDetail>>;

export default function SectorDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<SectorDetail | null>(null);

  useEffect(() => {
    api.getSectorDetail(code).then(setData).catch(() => {});
  }, [code]);

  if (!data) return <div className="p-10 text-center text-muted-foreground">Memuat...</div>;

  const top15 = data.provinces.slice(0, 15);

  const chartOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: 140, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "value" as const },
    yAxis: { type: "category" as const, data: [...top15].reverse().map((p) => p.province_name), axisLabel: { fontSize: 11 } },
    series: [{ type: "bar" as const, data: [...top15].reverse().map((p) => p.output_miliar_rp), itemStyle: { color: "#1e3a5f" } }],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">← Kembali</Link>

      <div className="mt-4 mb-8">
        <Badge className="mb-2">{data.sector.code}</Badge>
        <h1 className="text-3xl font-bold">{data.sector.name}</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Output Nasional</p>
          <p className="text-xl font-bold">{formatRupiah(data.total_output_triliun_rp * 1000)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">VA Nasional</p>
          <p className="text-xl font-bold">{formatRupiah(data.total_va_triliun_rp * 1000)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Rata-rata BL Index</p>
          <p className="text-xl font-bold">{data.avg_bl_index.toFixed(3)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Rata-rata FL Index</p>
          <p className="text-xl font-bold">{data.avg_fl_index.toFixed(3)}</p>
        </CardContent></Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base">Top 15 Provinsi berdasarkan Output</CardTitle></CardHeader>
        <CardContent><EChartsReact option={chartOption} style={{ height: 400 }} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Detail per Provinsi</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Provinsi</th>
                  <th className="py-2 pr-4">Wilayah</th>
                  <th className="py-2 pr-4 text-right">Output (Miliar)</th>
                  <th className="py-2 pr-4 text-right">VA (Miliar)</th>
                  <th className="py-2 pr-4 text-right">BL</th>
                  <th className="py-2 pr-4 text-right">FL</th>
                  <th className="py-2">Klasifikasi</th>
                </tr>
              </thead>
              <tbody>
                {data.provinces.map((p, i) => (
                  <tr key={p.province_code} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-4">
                      <Link href={`/explore/provinces/${p.province_code}`} className="text-blue-600 hover:underline">
                        {p.province_name}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-4 text-xs text-muted-foreground">{p.region}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.output_miliar_rp.toFixed(0)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.va_miliar_rp.toFixed(0)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.bl_index.toFixed(3)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.fl_index.toFixed(3)}</td>
                    <td className="py-1.5"><Badge variant="secondary" className="text-xs">{p.classification.split(" (")[0]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
