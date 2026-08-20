"use client";

import { useMemo, useState } from "react";

interface ProvinceImpact {
  province_code: string;
  province_name: string;
  value: number;
}

interface IndonesiaMapProps {
  data: ProvinceImpact[];
  valueLabel?: string;
  formatValue?: (v: number) => string;
  isNegative?: boolean;
}

const PROVINCE_GRID: Record<string, { col: number; row: number; label: string }> = {
  "11": { col: 1, row: 0, label: "Aceh" },
  "12": { col: 1, row: 1, label: "SumUt" },
  "13": { col: 0, row: 2, label: "SumBa" },
  "14": { col: 1, row: 2, label: "Riau" },
  "21": { col: 2, row: 2, label: "KepRi" },
  "15": { col: 0, row: 3, label: "Jambi" },
  "16": { col: 1, row: 4, label: "SumSe" },
  "17": { col: 0, row: 4, label: "Bengk" },
  "19": { col: 1, row: 3, label: "BaBel" },
  "18": { col: 0, row: 5, label: "Lamp" },
  "36": { col: 2, row: 6, label: "Bant" },
  "31": { col: 3, row: 6, label: "DKI" },
  "32": { col: 4, row: 6, label: "JaBa" },
  "33": { col: 5, row: 6, label: "JaTe" },
  "34": { col: 5, row: 7, label: "DIY" },
  "35": { col: 6, row: 6, label: "JaTi" },
  "51": { col: 7, row: 6, label: "Bali" },
  "52": { col: 8, row: 6, label: "NTB" },
  "53": { col: 9, row: 7, label: "NTT" },
  "61": { col: 5, row: 2, label: "KalBa" },
  "62": { col: 5, row: 3, label: "KalTe" },
  "63": { col: 6, row: 3, label: "KalSe" },
  "64": { col: 6, row: 2, label: "KalTi" },
  "65": { col: 6, row: 1, label: "KalUt" },
  "71": { col: 8, row: 1, label: "SulUt" },
  "75": { col: 9, row: 1, label: "Goro" },
  "72": { col: 8, row: 2, label: "SulTe" },
  "73": { col: 8, row: 3, label: "SulSe" },
  "76": { col: 7, row: 3, label: "SulBa" },
  "74": { col: 9, row: 3, label: "SulTr" },
  "82": { col: 10, row: 1, label: "MalUt" },
  "81": { col: 10, row: 3, label: "Malu" },
  "91": { col: 11, row: 2, label: "PapBa" },
  "94": { col: 12, row: 2, label: "Papua" },
};

const REGION_LABELS: { label: string; col: number; row: number }[] = [
  { label: "SUMATERA", col: 0.5, row: -0.5 },
  { label: "JAWA", col: 4, row: 5.4 },
  { label: "KALIMANTAN", col: 5.5, row: 0.5 },
  { label: "SULAWESI", col: 8.5, row: 0.5 },
  { label: "MALUKU", col: 10, row: 0.5 },
  { label: "PAPUA", col: 11.5, row: 1.5 },
  { label: "NUSA TENGGARA", col: 8, row: 5.4 },
];

function interpolateColor(t: number, isNeg: boolean): string {
  t = Math.max(0, Math.min(1, t));
  if (isNeg) {
    const r = Math.round(254 - (254 - 127) * t);
    const g = Math.round(235 - (235 - 29) * t);
    const b = Math.round(235 - (235 - 29) * t);
    return `rgb(${r},${g},${b})`;
  }
  const r = Math.round(235 - (235 - 21) * t);
  const g = Math.round(245 - (245 - 101) * t);
  const b = Math.round(255 - (255 - 192) * t);
  return `rgb(${r},${g},${b})`;
}

export default function IndonesiaMap({ data, valueLabel = "Dampak", formatValue, isNegative = false }: IndonesiaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { dataMap, maxAbs } = useMemo(() => {
    const map = new Map<string, ProvinceImpact>();
    let max = 0;
    for (const d of data) {
      map.set(d.province_code, d);
      const abs = Math.abs(d.value);
      if (abs > max) max = abs;
    }
    return { dataMap: map, maxAbs: max };
  }, [data]);

  const cellSize = 48;
  const gap = 3;
  const step = cellSize + gap;
  const cols = 13;
  const rows = 8;
  const padX = 16;
  const padY = 28;
  const svgW = padX * 2 + cols * step;
  const svgH = padY + 12 + rows * step;

  const hoveredData = hovered ? dataMap.get(hovered) : null;
  const hoveredGrid = hovered ? PROVINCE_GRID[hovered] : null;

  const legendSteps = 5;
  const legendW = 120;
  const legendH = 10;
  const legendX = svgW - padX - legendW;
  const legendY = svgH - 16;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: 420 }}>
        {REGION_LABELS.map((r) => (
          <text
            key={r.label}
            x={padX + r.col * step + cellSize / 2}
            y={padY + r.row * step + cellSize / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 7, fontWeight: 600, letterSpacing: "0.05em", opacity: 0.4 }}
          >
            {r.label}
          </text>
        ))}

        {Object.entries(PROVINCE_GRID).map(([code, pos]) => {
          const d = dataMap.get(code);
          const val = d ? d.value : 0;
          const t = maxAbs > 0 ? Math.abs(val) / maxAbs : 0;
          const color = d ? interpolateColor(t, isNegative) : "#f3f4f6";
          const x = padX + pos.col * step;
          const y = padY + pos.row * step;
          const isHov = hovered === code;

          return (
            <g
              key={code}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={4}
                fill={color}
                stroke={isHov ? "#1e3a5f" : "#e5e7eb"}
                strokeWidth={isHov ? 1.5 : 0.5}
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 7, fontWeight: 600 }}
                fill={t > 0.6 ? "#fff" : "#374151"}
              >
                {pos.label}
              </text>
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 7}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 5.5, fontWeight: 400 }}
                fill={t > 0.6 ? "rgba(255,255,255,0.85)" : "#6b7280"}
              >
                {d && formatValue ? formatValue(d.value) : ""}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <text x={legendX} y={legendY - 3} style={{ fontSize: 6 }} className="fill-muted-foreground">
          {isNegative ? "Dampak Terbesar" : "Dampak Terbesar"}
        </text>
        {Array.from({ length: legendSteps }).map((_, i) => {
          const t = i / (legendSteps - 1);
          return (
            <rect
              key={i}
              x={legendX + (legendW / legendSteps) * i}
              y={legendY}
              width={legendW / legendSteps}
              height={legendH}
              fill={interpolateColor(t, isNegative)}
              stroke="#e5e7eb"
              strokeWidth={0.3}
            />
          );
        })}
        <text x={legendX} y={legendY + legendH + 7} style={{ fontSize: 5 }} className="fill-muted-foreground">
          Rendah
        </text>
        <text x={legendX + legendW} y={legendY + legendH + 7} textAnchor="end" style={{ fontSize: 5 }} className="fill-muted-foreground">
          Tinggi
        </text>
      </svg>

      {hoveredData && hoveredGrid && (
        <div
          className="absolute z-10 bg-popover border rounded-md shadow-lg px-3 py-2 pointer-events-none text-sm"
          style={{
            left: `${((padX + hoveredGrid.col * step + cellSize) / svgW) * 100}%`,
            top: `${((padY + hoveredGrid.row * step) / svgH) * 100}%`,
            transform: "translateY(-50%)",
            minWidth: 160,
          }}
        >
          <p className="font-semibold text-xs">{hoveredData.province_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {valueLabel}: {formatValue ? formatValue(hoveredData.value) : hoveredData.value.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
