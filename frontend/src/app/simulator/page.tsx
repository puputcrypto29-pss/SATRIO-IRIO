"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Province, type Sector, type SimulationResult } from "@/lib/api";

export default function SimulatorPage() {
  const router = useRouter();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [shockValue, setShockValue] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("decrease");
  const [baselineGrowth, setBaselineGrowth] = useState("5.0");
  const [scenarioName, setScenarioName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getProvinces(), api.getSectors()])
      .then(([p, s]) => {
        setProvinces(p);
        setSectors(s);
      })
      .catch(() => setError("Gagal memuat data. Pastikan backend berjalan."));
  }, []);

  const selectedProvName = provinces.find((p) => p.code === selectedProvince)?.name || "";
  const selectedSectName = sectors.find((s) => s.code === selectedSector)?.name || "";

  const canSubmit = selectedProvince && selectedSector && shockValue && parseFloat(shockValue) > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const result: SimulationResult = await api.createSimulation({
        name: scenarioName || `${selectedProvName} - ${selectedSectName}`,
        shocks: [
          {
            province_code: selectedProvince,
            sector_code: selectedSector,
            value_billion_rp: parseFloat(shockValue),
            direction,
          },
        ],
        baseline_growth: parseFloat(baselineGrowth) || 0,
      });

      router.push(`/simulation/${result.scenario_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulasi gagal");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Simulator Dampak Ekonomi</h1>
        <p className="text-muted-foreground mt-2">
          Simulasikan shock ekonomi pada sektor dan provinsi tertentu, lalu lihat
          dampaknya ke seluruh Indonesia.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Province */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-xs font-bold">
                1
              </span>
              Pilih Provinsi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Pilih Provinsi --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Step 2: Sector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-xs font-bold">
                2
              </span>
              Pilih Lapangan Usaha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Pilih Lapangan Usaha --</option>
              {sectors.map((s) => (
                <option key={s.code} value={s.code}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Step 3: Shock */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-xs font-bold">
                3
              </span>
              Tentukan Shock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shock-value">Nilai Shock (Rp Miliar)</Label>
              <Input
                id="shock-value"
                type="number"
                placeholder="contoh: 1000"
                value={shockValue}
                onChange={(e) => setShockValue(e.target.value)}
                min="0"
                step="0.01"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Penurunan Rp1 triliun = masukkan 1.000 dan pilih &quot;Penurunan&quot;
              </p>
            </div>

            <div>
              <Label>Jenis Shock</Label>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setDirection("increase")}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    direction === "increase"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Peningkatan
                </button>
                <button
                  onClick={() => setDirection("decrease")}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    direction === "decrease"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Penurunan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseline">Baseline Pertumbuhan PDRB (%)</Label>
                <Input
                  id="baseline"
                  type="number"
                  value={baselineGrowth}
                  onChange={(e) => setBaselineGrowth(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scenario-name">Nama Skenario (opsional)</Label>
                <Input
                  id="scenario-name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="contoh: Bali Tourism Shock"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {canSubmit && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                <strong>Ringkasan:</strong>{" "}
                {direction === "decrease" ? "Penurunan" : "Peningkatan"} sebesar{" "}
                <strong>Rp{parseFloat(shockValue).toLocaleString("id-ID")} miliar</strong> pada sektor{" "}
                <strong>{selectedSectName}</strong> di{" "}
                <strong>{selectedProvName}</strong>.
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-semibold"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menghitung...
            </span>
          ) : (
            "Jalankan Simulasi"
          )}
        </Button>
      </div>
    </div>
  );
}
