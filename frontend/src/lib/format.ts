export function formatRupiah(valueMilliar: number): string {
  const abs = Math.abs(valueMilliar);
  const sign = valueMilliar < 0 ? "-" : "";

  if (abs >= 1000) {
    const triliun = abs / 1000;
    return `${sign}Rp${triliun.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} triliun`;
  }
  if (abs >= 1) {
    return `${sign}Rp${abs.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} miliar`;
  }
  const juta = abs * 1000;
  return `${sign}Rp${juta.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} juta`;
}

export function formatRupiahShort(valueMilliar: number): string {
  const abs = Math.abs(valueMilliar);
  const sign = valueMilliar < 0 ? "-" : "";

  if (abs >= 1000) {
    const triliun = abs / 1000;
    return `${sign}Rp${triliun.toFixed(2)}T`;
  }
  if (abs >= 1) {
    return `${sign}Rp${abs.toFixed(2)}M`;
  }
  return `${sign}Rp${(abs * 1000).toFixed(0)}jt`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? "" : ""}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}
