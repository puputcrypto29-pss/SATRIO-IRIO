"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

type ProvinceDetail = Awaited<ReturnType<typeof api.getProvinceDetail>>;

export default function ProvinceDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<ProvinceDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProvinceDetail(code).then(setData).catch((e) => setError(e.message));
  }, [code]);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-10 text-center text-muted-foreground">Memuat...</div>;

  const sectorChart = {
    tooltip: { trigger: "axis" as const },
    grid: { left: 20, right: 20, top: 10, bottom: 120 },
    xAxis: { type: "category" as const, data: data.sectors.map((s) => s.sector_code), axisLabel: { rotate: 45 } },
    yAxis: { type: "value" as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}T` } },
    series: [
      { name: "Output", type: "bar" as const, data: data.sectors.map((s) => s.output_miliar_rp), itemStyle: { color: "#1e3a5f" } },
      { name: "VA", type: "bar" as const, data: data.sectors.map((s) => s.va_miliar_rp), itemStyle: { color: "#3b82f6" } },
    ],
  };

  const flblChart = {
    tooltip: { trigger: "item" as const, formatter: (p: {data: number[]; name: string}) => `${p.name}<br/>BL: ${p.data[0].toFixed(3)}, FL: ${p.data[1].toFixed(3)}` },
    xAxis: { name: "Backward Linkage", min: 0 },
    yAxis: { name: "Forward Linkage", min: 0 },
    series: [{
      type: "scatter" as const,
      data: data.sectors.map((s) => ({ value: [s.bl_index, s.fl_index], name: s.sector_code })),
      label: { show: true, formatter: (p: {name: string}) => p.name, position: "right", fontSize: 10 },
      itemStyle: { color: "#1e3a5f" },
      symbolSize: 12,
    }],
    markLine: { data: [{ xAxis: 1 }, { yAxis: 1 }] },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">← Kembali</Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold">{data.province.name}</h1>
        <Badge variant="secondary" className="mt-1">{data.province.region}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Output</p>
            <p className="text-xl font-bold">{formatRupiah(data.pdrb?.total_output_miliar_rp || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">PDRB</p>
            <p className="text-xl font-bold">{formatRupiah(data.pdrb?.pdrb_miliar_rp || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Keterkaitan Intra-Provinsi</p>
            <p className="text-xl font-bold">{data.intra_linkage.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Output & VA per Sektor</CardTitle></CardHeader>
          <CardContent><EChartsReact option={sectorChart} style={{ height: 300 }} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">FL/BL per Sektor</CardTitle></CardHeader>
          <CardContent><EChartsReact option={flblChart} style={{ height: 300 }} /></CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Bergantung pada Provinsi...</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.depends_on.slice(0, 10).map((d, i) => (
                <div key={d.province_code} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. <Link href={`/explore/provinces/${d.province_code}`} className="text-blue-600 hover:underline">{d.province_name}</Link></span>
                  <span className="tabular-nums text-muted-foreground">{d.linkage_strength.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Berpengaruh terhadap Provinsi...</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.matters_to.slice(0, 10).map((d, i) => (
                <div key={d.province_code} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. <Link href={`/explore/provinces/${d.province_code}`} className="text-blue-600 hover:underline">{d.province_name}</Link></span>
                  <span className="tabular-nums text-muted-foreground">{d.linkage_strength.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detail Sektor</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Kode</th>
                  <th className="py-2 pr-4">Sektor</th>
                  <th className="py-2 pr-4 text-right">Output (Miliar)</th>
                  <th className="py-2 pr-4 text-right">VA (Miliar)</th>
                  <th className="py-2 pr-4 text-right">VA Coeff</th>
                  <th className="py-2 pr-4 text-right">BL</th>
                  <th className="py-2 pr-4 text-right">FL</th>
                  <th className="py-2">Klasifikasi</th>
                </tr>
              </thead>
              <tbody>
                {data.sectors.map((s) => (
                  <tr key={s.sector_code} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 font-mono text-xs">{s.sector_code}</td>
                    <td className="py-1.5 pr-4 text-xs">{s.sector_name}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.output_miliar_rp.toFixed(0)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.va_miliar_rp.toFixed(0)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.va_coefficient.toFixed(3)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.bl_index.toFixed(3)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.fl_index.toFixed(3)}</td>
                    <td className="py-1.5">
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {s.classification.split(" (")[0]}
                      </Badge>
                    </td>
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
