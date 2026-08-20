"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type ModelValidation } from "@/lib/api";

const datasets = [
  { name: "Metadata Provinsi", description: "34 provinsi dengan kode, nama, dan wilayah", endpoint: "/metadata/provinces", records: 34 },
  { name: "Metadata Sektor", description: "17 lapangan usaha dengan kode dan nama", endpoint: "/metadata/sectors", records: 17 },
  { name: "Output & Nilai Tambah", description: "Output, VA, dan VA coefficient per provinsi-sektor", endpoint: "/linkages/province-sectors", records: 578 },
  { name: "PDRB Provinsi", description: "Total output dan PDRB per provinsi", endpoint: "/metadata/provinces", records: 34 },
  { name: "Forward & Backward Linkage", description: "FL/BL index per provinsi-sektor (578 observasi)", endpoint: "/linkages/province-sectors", records: 578 },
  { name: "Keterkaitan Bilateral", description: "Matriks bilateral 34×34 provinsi", endpoint: "/linkages/bilateral", records: 1156 },
  { name: "Koefisien Teknis", description: "Matriks A (578×578) — tersedia via API", endpoint: null, records: 334084 },
  { name: "Leontief Inverse", description: "Matriks L (578×578) — tersedia via API", endpoint: null, records: 334084 },
];

export default function DataPage() {
  const [validation, setValidation] = useState<ModelValidation | null>(null);

  useEffect(() => {
    api.getModelValidation().then(setValidation).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Data</h1>
      <p className="text-muted-foreground mb-8">
        Katalog dataset yang tersedia dalam platform SATRIO. Data bersumber dari
        Tabel Input-Output Antarwilayah Indonesia 2016.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {datasets.map((ds, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{ds.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{ds.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                  {ds.records.toLocaleString("id-ID")} records
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Status Model
            {validation && (
              <Badge variant={validation.overall_status === "VALID" ? "default" : "destructive"}>
                {validation.overall_status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation ? (
            <div className="space-y-2">
              {Object.entries(validation.checks).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${val.status === "PASS" ? "bg-emerald-500" : val.status === "WARNING" ? "bg-amber-500" : "bg-red-500"}`} />
                  <span>{key.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{val.detail}</span>
                  <Badge variant={val.status === "PASS" ? "secondary" : "destructive"} className="text-xs">
                    {val.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Memuat validasi model...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
