"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type BilateralMatrix } from "@/lib/api";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function BilateralPage() {
  const [matrix, setMatrix] = useState<BilateralMatrix | null>(null);

  useEffect(() => {
    api.getBilateral().then(setMatrix).catch(() => {});
  }, []);

  const heatmapOption = matrix ? {
    tooltip: {
      position: "top" as const,
      formatter: (p: {data: number[]}) =>
        `${matrix.labels[p.data[1]]} → ${matrix.labels[p.data[0]]}<br/>Keterkaitan: ${p.data[2].toFixed(3)}`,
    },
    grid: { left: 120, right: 40, top: 120, bottom: 20 },
    xAxis: {
      type: "category" as const,
      data: matrix.labels,
      axisLabel: { rotate: 90, fontSize: 9, interval: 0 },
      position: "top" as const,
    },
    yAxis: {
      type: "category" as const,
      data: [...matrix.labels].reverse(),
      axisLabel: { fontSize: 9, interval: 0 },
    },
    visualMap: {
      min: 0,
      max: Math.max(...matrix.matrix.flat().filter((v) => v < matrix.matrix.reduce((m, row, i) => Math.max(m, row[i]), 0))),
      calculable: true,
      orient: "horizontal" as const,
      left: "center",
      bottom: 0,
      inRange: { color: ["#f0f9ff", "#bae6fd", "#38bdf8", "#1e3a5f", "#0f172a"] },
    },
    series: [{
      type: "heatmap" as const,
      data: matrix.matrix.flatMap((row, i) =>
        row.map((val, j) => [j, matrix!.labels.length - 1 - i, parseFloat(val.toFixed(4))])
      ),
      label: { show: false },
      itemStyle: { borderColor: "#fff", borderWidth: 0.5 },
    }],
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/linkages" className="text-sm text-muted-foreground hover:text-foreground">← Keterkaitan</Link>

      <h1 className="text-3xl font-bold mt-4 mb-2">Keterkaitan Bilateral Antarprovinsi</h1>
      <p className="text-muted-foreground mb-8">
        Heatmap menunjukkan kekuatan keterkaitan bilateral antara setiap pasangan provinsi berdasarkan sub-matriks Leontief inverse.
      </p>

      {heatmapOption && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriks Bilateral 34×34</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <EChartsReact option={heatmapOption} style={{ height: 700, minWidth: 800 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Baca kolom: jika demand provinsi kolom naik, berapa besar dampak ke output provinsi baris.
              Diagonal menunjukkan keterkaitan intra-provinsi.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
