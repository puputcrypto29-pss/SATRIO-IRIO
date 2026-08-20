export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-400">
              SATRIO — Sistem Analisis Transaksi Regional Input-Output
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Platform Analisis IRIO Indonesia untuk Keterkaitan Sektoral, Antarwilayah, Multiplier, dan Simulasi Dampak Ekonomi
            </p>
          </div>
          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>Data: Tabel Input-Output Antarwilayah Indonesia 2016</p>
            <p className="mt-1">Model: Inter-Regional Input-Output (Leontief Demand-Pull)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
