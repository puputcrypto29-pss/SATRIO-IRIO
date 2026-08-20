"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type SimulationResult } from "@/lib/api";
import { formatRupiah, formatPercent, formatMultiplier } from "@/lib/format";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), { ssr: false });

function KPICard({ label, value, subtitle, color }: { label: string; value: string; subtitle?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-lg md:text-xl font-bold mt-1 ${color || "text-foreground"}`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function SimulationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSimulation(id).then(setResult).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Skenario Tidak Ditemukan</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Link href="/simulator" className="mt-4 inline-block">
          <Button>Kembali ke Simulator</Button>
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-96 mx-auto" />
        </div>
      </div>
    );
  }

  const shock = result.shocks[0];
  const isNeg = shock.direction === "decrease";

  const sortedProvinces = [...result.province_impacts].sort(
    (a, b) => Math.abs(b.delta_pdrb_miliar) - Math.abs(a.delta_pdrb_miliar)
  );
  const sortedSectors = [...result.sector_impacts].sort(
    (a, b) => Math.abs(b.delta_output_miliar) - Math.abs(a.delta_output_miliar)
  );

  const topProvinces = sortedProvinces.slice(0, 10);
  const topSectors = sortedSectors.slice(0, 10);

  const provinceBarOption = {
    tooltip: { trigger: "axis" as const, formatter: (params: Array<{name: string; value: number}>) => {
      const p = params[0];
      return `${p.name}<br/>ΔPDRB: ${formatRupiah(p.value)}`;
    }},
    grid: { left: 140, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "value" as const, axisLabel: { formatter: (v: number) => `${(v).toFixed(0)}` } },
    yAxis: { type: "category" as const, data: [...topProvinces].reverse().map((p) => p.province_name), axisLabel: { fontSize: 11 } },
    series: [{ type: "bar" as const, data: [...topProvinces].reverse().map((p) => ({ value: p.delta_pdrb_miliar, itemStyle: { color: p.impact_type === "Local" ? "#1e3a5f" : "#3b82f6" } })) }],
  };

  const sectorBarOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: 20, right: 20, top: 10, bottom: 120 },
    xAxis: { type: "category" as const, data: topSectors.map((s) => s.sector_code), axisLabel: { rotate: 45, fontSize: 11 } },
    yAxis: { type: "value" as const },
    series: [
      { name: "ΔOutput", type: "bar" as const, data: topSectors.map((s) => s.delta_output_miliar), itemStyle: { color: "#1e3a5f" } },
      { name: "ΔVA", type: "bar" as const, data: topSectors.map((s) => s.delta_va_miliar), itemStyle: { color: "#3b82f6" } },
    ],
  };

  const spilloverDonutOption = {
    tooltip: { trigger: "item" as const },
    series: [{
      type: "pie" as const,
      radius: ["50%", "75%"],
      label: { show: true, formatter: "{b}\n{d}%" },
      data: [
        { value: Math.abs(result.local_share_pct), name: "Lokal", itemStyle: { color: "#1e3a5f" } },
        { value: Math.abs(result.spillover_share_pct), name: "Spillover", itemStyle: { color: "#60a5fa" } },
      ],
    }],
  };

  const sankeyData = result.transmission_flows.length > 0 ? {
    tooltip: { trigger: "item" as const },
    series: [{
      type: "sankey" as const,
      layout: "none",
      emphasis: { focus: "adjacency" as const },
      nodeAlign: "left" as const,
      data: Array.from(new Set(result.transmission_flows.flatMap((f) => [f.source, f.target]))).map((n) => ({ name: n })),
      links: result.transmission_flows.map((f) => ({ source: f.source, target: f.target, value: f.value })),
      lineStyle: { color: "gradient" as const, curveness: 0.5 },
    }],
  } : null;

  function downloadCSV() {
    if (!result) return;
    const lines = ["Provinsi,Delta Output (Miliar Rp),Delta PDRB (Miliar Rp),Dampak PDRB (%),Tipe"];
    result.province_impacts.forEach((p) => {
      lines.push(`${p.province_name},${p.delta_output_miliar.toFixed(2)},${p.delta_pdrb_miliar.toFixed(2)},${p.pdrb_impact_pct.toFixed(4)},${p.impact_type}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satrio-${result.scenario_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/simulator" className="text-sm text-muted-foreground hover:text-foreground">
            ← Simulator
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Ringkasan Dampak Ekonomi</h1>
        <p className="text-muted-foreground mt-1">
          Estimasi dampak {isNeg ? "penurunan" : "peningkatan"}{" "}
          {formatRupiah(result.initial_shock_miliar)} pada sektor{" "}
          {result.shocks.map((s) => {
            const sect = result.sector_impacts.find((si) => si.sector_code === s.sector_code);
            return sect?.sector_name || s.sector_code;
          }).join(", ")}{" "}
          di{" "}
          {result.province_impacts.find((p) => p.impact_type === "Local")?.province_name || ""}.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard label="Shock Awal" value={formatRupiah(result.initial_shock_miliar)} />
        <KPICard label="Dampak Output Total" value={formatRupiah(result.total_output_impact_miliar)} color={isNeg ? "text-red-600" : "text-emerald-600"} />
        <KPICard label="Dampak PDRB Total" value={formatRupiah(result.total_pdrb_impact_miliar)} color={isNeg ? "text-red-600" : "text-emerald-600"} />
        <KPICard label="Dampak Lokal" value={formatRupiah(result.local_output_impact_miliar)} subtitle={`${Math.abs(result.local_share_pct).toFixed(1)}%`} />
        <KPICard label="Dampak Spillover" value={formatRupiah(result.spillover_output_impact_miliar)} subtitle={`${Math.abs(result.spillover_share_pct).toFixed(1)}%`} />
        <KPICard label="Provinsi Terdampak" value={String(result.provinces_affected)} />
      </div>

      {/* Multipliers */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <KPICard label="Output Multiplier" value={formatMultiplier(result.output_multiplier)} subtitle="Total output / shock awal" />
        <KPICard label="VA/PDRB Multiplier" value={formatMultiplier(result.va_multiplier)} subtitle="Total VA / shock awal" />
        <KPICard label="Spillover Ratio" value={formatPercent(result.spillover_ratio_output * 100)} subtitle="Porsi dampak antarwilayah" />
      </div>

      {/* Insight */}
      <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">Interpretasi Otomatis</Badge>
            <p className="text-sm leading-relaxed">{result.insight}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Local vs Spillover */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dampak Lokal vs Spillover</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsReact option={spilloverDonutOption} style={{ height: 250 }} />
            <p className="text-xs text-muted-foreground mt-2">
              Dampak lokal terjadi di provinsi asal shock, sementara spillover menangkap efek yang ditransmisikan ke provinsi lain melalui keterkaitan produksi antarwilayah.
            </p>
          </CardContent>
        </Card>

        {/* Top Provinces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provinsi Paling Terdampak</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsReact option={provinceBarOption} style={{ height: 300 }} />
          </CardContent>
        </Card>
      </div>

      {/* Top Sectors */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Sektor Paling Terdampak</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsReact option={sectorBarOption} style={{ height: 300 }} />
        </CardContent>
      </Card>

      {/* Province Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Dampak per Provinsi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium">#</th>
                  <th className="py-2 pr-4 font-medium">Provinsi</th>
                  <th className="py-2 pr-4 font-medium text-right">ΔOutput (Miliar)</th>
                  <th className="py-2 pr-4 font-medium text-right">ΔPDRB (Miliar)</th>
                  <th className="py-2 pr-4 font-medium text-right">Dampak PDRB (%)</th>
                  <th className="py-2 font-medium">Tipe</th>
                </tr>
              </thead>
              <tbody>
                {sortedProvinces.map((p, i) => (
                  <tr key={p.province_code} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-4 font-medium">{p.province_name}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.delta_output_miliar.toFixed(2)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.delta_pdrb_miliar.toFixed(2)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{p.pdrb_impact_pct.toFixed(4)}%</td>
                    <td className="py-1.5">
                      <Badge variant={p.impact_type === "Local" ? "default" : "secondary"} className="text-xs">
                        {p.impact_type === "Local" ? "Lokal" : "Spillover"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sankey */}
      {sankeyData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Transmisi Dampak Antarwilayah</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsReact option={sankeyData} style={{ height: 400 }} />
            <p className="text-xs text-muted-foreground mt-2">
              Diagram menunjukkan bagaimana shock dari provinsi asal menyebar ke provinsi lain melalui keterkaitan produksi dalam model IRIO.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Validasi Perhitungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(result.validation).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${val.status === "PASS" ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                <Badge variant={val.status === "PASS" ? "secondary" : "destructive"} className="text-xs ml-auto">
                  {val.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={downloadCSV} variant="outline">
          Unduh CSV
        </Button>
        <Link href="/simulator">
          <Button variant="outline">Simulasi Baru</Button>
        </Link>
      </div>
    </div>
  );
}
