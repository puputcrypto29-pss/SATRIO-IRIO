"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type LinkageItem } from "@/lib/api";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS: Record<string, string> = {
  "Key Sector": "#dc2626",
  "Strong BL": "#f59e0b",
  "Strong FL": "#3b82f6",
  "Weak": "#94a3b8",
  "Key Region": "#dc2626",
};

export default function LinkagesPage() {
  const [level, setLevel] = useState<"sector" | "province">("sector");
  const [sectorData, setSectorData] = useState<LinkageItem[]>([]);
  const [provinceData, setProvinceData] = useState<LinkageItem[]>([]);

  useEffect(() => {
    api.getLinkagesSectors().then(setSectorData).catch(() => {});
    api.getLinkagesProvinces().then(setProvinceData).catch(() => {});
  }, []);

  const data = level === "sector" ? sectorData : provinceData;
  const nameKey = level === "sector" ? "sector_name" : "province_name";
  const codeKey = level === "sector" ? "sector_code" : "province_code";

  const scatterOption = data.length > 0 ? {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: {data: {value: number[]; name: string; cls: string}}) =>
        `${p.data.name}<br/>BL: ${p.data.value[0].toFixed(3)}<br/>FL: ${p.data.value[1].toFixed(3)}<br/>${p.data.cls}`,
    },
    grid: { left: 60, right: 40, top: 40, bottom: 60 },
    xAxis: {
      name: "Backward Linkage Index",
      nameLocation: "middle" as const,
      nameGap: 35,
      min: 0,
      splitLine: { show: true, lineStyle: { type: "dashed" as const, opacity: 0.3 } },
    },
    yAxis: {
      name: "Forward Linkage Index",
      nameLocation: "middle" as const,
      nameGap: 40,
      min: 0,
      splitLine: { show: true, lineStyle: { type: "dashed" as const, opacity: 0.3 } },
    },
    series: [
      {
        type: "scatter" as const,
        symbolSize: 14,
        data: data.map((d) => ({
          value: [d.bl_index, d.fl_index],
          name: d[codeKey] || d[nameKey] || "",
          cls: d.classification,
          itemStyle: { color: COLORS[d.classification.split(" (")[0]] || COLORS[d.classification] || "#94a3b8" },
        })),
        label: {
          show: true,
          formatter: (p: {data: {name: string}}) => p.data.name,
          position: "right",
          fontSize: 10,
        },
      },
    ],
    markLine: {
      data: [
        { xAxis: 1, lineStyle: { color: "#94a3b8", type: "dashed" as const } },
        { yAxis: 1, lineStyle: { color: "#94a3b8", type: "dashed" as const } },
      ],
      label: { show: false },
      silent: true,
    },
  } : null;

  // Since markLine doesn't work on scatter directly, we use graphic annotations
  const chartOption = scatterOption ? {
    ...scatterOption,
    graphic: [
      { type: "text" as const, left: "75%", top: "10%", style: { text: "Key Sector", fill: "#dc2626", fontSize: 11, fontWeight: "bold" as const } },
      { type: "text" as const, left: "75%", bottom: "15%", style: { text: "Strong BL", fill: "#f59e0b", fontSize: 11, fontWeight: "bold" as const } },
      { type: "text" as const, left: "10%", top: "10%", style: { text: "Strong FL", fill: "#3b82f6", fontSize: 11, fontWeight: "bold" as const } },
      { type: "text" as const, left: "10%", bottom: "15%", style: { text: "Weak", fill: "#94a3b8", fontSize: 11, fontWeight: "bold" as const } },
    ],
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forward & Backward Linkage</h1>
          <p className="text-muted-foreground mt-1">
            Analisis keterkaitan ke depan dan ke belakang berdasarkan indeks Rasmussen-Hirschman.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setLevel("sector")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${level === "sector" ? "bg-[#1e3a5f] text-white" : "bg-muted"}`}
          >
            Sektor
          </button>
          <button
            onClick={() => setLevel("province")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${level === "province" ? "bg-[#1e3a5f] text-white" : "bg-muted"}`}
          >
            Provinsi
          </button>
        </div>
      </div>

      {chartOption && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">
              Scatterplot FL/BL — {level === "sector" ? "Lapangan Usaha (Nasional)" : "Provinsi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsReact option={chartOption} style={{ height: 500 }} />
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              {Object.entries(COLORS).filter(([k]) => !k.includes("Region")).map(([cls, color]) => (
                <div key={cls} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{cls}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base">Data Lengkap</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">{level === "sector" ? "Sektor" : "Provinsi"}</th>
                  <th className="py-2 pr-4 text-right">BL Index</th>
                  <th className="py-2 pr-4 text-right">FL Index</th>
                  <th className="py-2">Klasifikasi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-4 font-medium">{d[nameKey] as string}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{d.bl_index.toFixed(3)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{d.fl_index.toFixed(3)}</td>
                    <td className="py-1.5"><Badge variant="secondary" className="text-xs">{(d.classification || "").split(" (")[0]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/linkages/bilateral">
          <button className="px-6 py-2 rounded-md bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#1e3a5f]/90">
            Lihat Keterkaitan Bilateral →
          </button>
        </Link>
      </div>
    </div>
  );
}
