import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Apa itu Analisis Input-Output?",
    content: `Analisis Input-Output (IO) adalah kerangka ekonomi yang dikembangkan oleh Wassily Leontief untuk memodelkan keterkaitan antarsektor dalam suatu perekonomian. Model ini menangkap bagaimana output dari satu sektor menjadi input bagi sektor lainnya, sehingga memungkinkan analisis dampak perubahan permintaan terhadap seluruh perekonomian.`,
  },
  {
    title: "Apa itu IRIO?",
    content: `Inter-Regional Input-Output (IRIO) memperluas model IO standar ke dimensi antarwilayah. Alih-alih hanya memodelkan keterkaitan antarsektor dalam satu wilayah, IRIO juga menangkap aliran perdagangan dan keterkaitan produksi antarprovinsi. Dalam konteks Indonesia, model IRIO berukuran 578×578 (34 provinsi × 17 sektor), menangkap seluruh interaksi ekonomi antarprovinsi dan antarsektor.`,
  },
  {
    title: "Koefisien Teknis",
    content: `Koefisien teknis (A) menunjukkan proporsi input dari sektor i yang dibutuhkan untuk menghasilkan satu unit output sektor j.`,
    formula: "a_ij = z_ij / X_j",
    formulaDesc: "di mana z_ij = transaksi dari sektor i ke sektor j, dan X_j = total output sektor j",
  },
  {
    title: "Leontief Inverse",
    content: `Leontief inverse matrix (L) menangkap total dampak (langsung + tidak langsung) dari perubahan permintaan akhir terhadap output seluruh sektor. Ini adalah inti dari model Input-Output.`,
    formula: "L = (I - A)^(-1)",
    formulaDesc: "di mana I = matriks identitas, A = matriks koefisien teknis",
  },
  {
    title: "Shock Ekonomi (Demand-Pull)",
    content: `Simulasi shock menggunakan model Leontief demand-pull: perubahan permintaan akhir (ΔF) pada suatu sektor-provinsi menghasilkan dampak terhadap output seluruh ekonomi melalui keterkaitan produksi.`,
    formula: "ΔX = L × ΔF",
    formulaDesc: "di mana ΔX = perubahan output, L = Leontief inverse, ΔF = vektor shock permintaan akhir",
  },
  {
    title: "Dampak Nilai Tambah / PDRB",
    content: `Dampak terhadap Nilai Tambah Bruto (Value Added) dihitung menggunakan koefisien VA, yaitu rasio VA terhadap total output setiap sektor.`,
    formula: "ΔVA_i = VA_Coefficient_i × ΔX_i",
    formulaDesc: "di mana VA_Coefficient = VA / X untuk setiap sektor-provinsi",
  },
  {
    title: "Dampak Lokal vs Spillover",
    content: `Dampak lokal adalah efek ekonomi yang terjadi di provinsi asal shock, termasuk dampak langsung dan dampak tidak langsung intra-provinsi. Spillover adalah dampak yang ditransmisikan ke provinsi lain melalui keterkaitan produksi antarwilayah. Rasio spillover menunjukkan seberapa besar porsi dampak yang menyebar ke luar provinsi asal.`,
  },
  {
    title: "Forward Linkage (FL)",
    content: `Forward Linkage mengukur kemampuan sektor dalam mendorong produksi sektor-sektor di hilir. FL dihitung dari jumlah baris Leontief inverse dan dinormalisasi menggunakan indeks Rasmussen-Hirschman.`,
    formula: "FL_i = (1/n) × Σ_j L_ij / [(1/n²) × Σ_ij L_ij]",
    formulaDesc: "FL > 1 berarti sektor memiliki keterkaitan ke depan di atas rata-rata",
  },
  {
    title: "Backward Linkage (BL)",
    content: `Backward Linkage mengukur kemampuan sektor dalam menarik input dari sektor-sektor di hulu. BL dihitung dari jumlah kolom Leontief inverse.`,
    formula: "BL_j = (1/n) × Σ_i L_ij / [(1/n²) × Σ_ij L_ij]",
    formulaDesc: "BL > 1 berarti sektor memiliki keterkaitan ke belakang di atas rata-rata",
  },
  {
    title: "Klasifikasi Sektor",
    content: `Berdasarkan nilai FL dan BL, setiap sektor-provinsi diklasifikasikan menjadi:

• Key Sector: BL > 1 dan FL > 1 — keterkaitan hulu-hilir kuat
• Strong BL: BL > 1, FL ≤ 1 — banyak menarik input, kurang mendorong hilir
• Strong FL: BL ≤ 1, FL > 1 — banyak mendorong hilir, kurang menarik input
• Weak: BL ≤ 1, FL ≤ 1 — keterkaitan di bawah rata-rata`,
  },
  {
    title: "Keterbatasan Model",
    content: `1. Model IRIO bersifat linear dan proporsional — tidak menangkap economies of scale atau perubahan teknologi.
2. Koefisien teknis diasumsikan tetap (fixed technology assumption).
3. Model ini bersifat demand-driven (demand-pull) — tidak memodelkan sisi penawaran.
4. Data IRIO 2016 mungkin tidak sepenuhnya mencerminkan struktur ekonomi saat ini.
5. Model tidak memperhitungkan perubahan harga, substitusi input, atau kapasitas produksi.
6. Dampak yang dihitung adalah potensi dampak berdasarkan struktur keterkaitan, bukan prediksi aktual.`,
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Metodologi</h1>
      <p className="text-muted-foreground mb-8">
        Penjelasan metode dan formula yang digunakan dalam platform SATRIO untuk analisis Inter-Regional Input-Output.
      </p>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
              {section.formula && (
                <div className="bg-muted/50 rounded-md p-3 border">
                  <code className="text-sm font-mono font-semibold text-[#1e3a5f] dark:text-blue-300">
                    {section.formula}
                  </code>
                  {section.formulaDesc && (
                    <p className="text-xs text-muted-foreground mt-1">{section.formulaDesc}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
