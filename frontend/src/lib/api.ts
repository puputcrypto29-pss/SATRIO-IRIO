const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export interface Province {
  id: number;
  code: string;
  name: string;
  region: string;
}

export interface Sector {
  id: number;
  code: string;
  name: string;
}

export interface Summary {
  province_count: number;
  sector_count: number;
  province_sector_count: number;
  total_output_triliun_rp: number;
  model_type: string;
  matrix_dimension: string;
}

export interface ShockInput {
  province_code: string;
  sector_code: string;
  value_billion_rp: number;
  direction: "increase" | "decrease";
}

export interface SimulationRequest {
  name: string;
  shocks: ShockInput[];
  baseline_growth: number;
}

export interface ProvinceImpact {
  province_code: string;
  province_name: string;
  region: string;
  delta_output_miliar: number;
  delta_pdrb_miliar: number;
  pdrb_baseline_miliar: number;
  pdrb_impact_pct: number;
  growth_impact_ppt: number;
  impact_type: "Local" | "Spillover";
}

export interface SectorImpact {
  sector_code: string;
  sector_name: string;
  delta_output_miliar: number;
  delta_va_miliar: number;
  share_output_pct: number;
  share_va_pct: number;
}

export interface SectorProvinceImpact {
  province_code: string;
  province_name: string;
  sector_code: string;
  sector_name: string;
  delta_output_miliar: number;
  delta_va_miliar: number;
  impact_type: string;
}

export interface TransmissionFlow {
  source: string;
  target: string;
  value: number;
  type: string;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_name: string;
  shocks: ShockInput[];
  initial_shock_miliar: number;
  total_output_impact_miliar: number;
  total_pdrb_impact_miliar: number;
  direct_impact_miliar: number;
  indirect_impact_miliar: number;
  local_output_impact_miliar: number;
  spillover_output_impact_miliar: number;
  local_va_impact_miliar: number;
  spillover_va_impact_miliar: number;
  output_multiplier: number;
  va_multiplier: number;
  spillover_ratio_output: number;
  local_share_pct: number;
  spillover_share_pct: number;
  province_impacts: ProvinceImpact[];
  sector_impacts: SectorImpact[];
  sector_province_impacts: SectorProvinceImpact[];
  provinces_affected: number;
  baseline_growth: number;
  validation: Record<string, { status: string; difference?: number }>;
  insight: string;
  transmission_flows: TransmissionFlow[];
}

export interface LinkageItem {
  province_code?: string;
  province_name?: string;
  sector_code?: string;
  sector_name?: string;
  region?: string;
  bl_raw: number;
  fl_raw: number;
  bl_index: number;
  fl_index: number;
  classification: string;
  intra_linkage?: number;
  extra_bl?: number;
  extra_fl?: number;
  pdrb_miliar_rp?: number;
  total_output_triliun?: number;
  total_va_triliun?: number;
}

export interface RegionLinkage {
  region: string;
  province_count: number;
  bl_raw: number;
  fl_raw: number;
  bl_index: number;
  fl_index: number;
  intra_regional: number;
  inter_regional_bl: number;
  inter_regional_fl: number;
  share_intra_bl_pct: number;
  share_intra_fl_pct: number;
  classification: string;
  pdrb_triliun_rp: number;
}

export interface BilateralMatrix {
  labels: string[];
  matrix: number[][];
}

export interface BilateralDetail {
  province_a: Province;
  province_b: Province;
  a_to_b: number;
  b_to_a: number;
  top_sector_links: { from_sector: string; from_sector_name: string; to_sector: string; to_sector_name: string; strength: number }[];
  total_bilateral: number;
}

export interface ModelValidation {
  overall_status: string;
  checks: Record<string, { status: string; detail: string }>;
}

// API functions
export const api = {
  getHealth: () => fetchAPI<{ status: string; version: string; model_loaded: boolean }>("/health"),
  getProvinces: () => fetchAPI<Province[]>("/metadata/provinces"),
  getSectors: () => fetchAPI<Sector[]>("/metadata/sectors"),
  getRegions: () => fetchAPI<Record<string, { code: string; name: string }[]>>("/metadata/regions"),
  getSummary: () => fetchAPI<Summary>("/metadata/summary"),

  createSimulation: (req: SimulationRequest) =>
    fetchAPI<SimulationResult>("/simulations", { method: "POST", body: JSON.stringify(req) }),
  getSimulation: (id: string) => fetchAPI<SimulationResult>(`/simulations/${id}`),

  getProvinceDetail: (code: string) => fetchAPI<{
    province: Province;
    pdrb: { province_code: string; province_name: string; total_output_juta_rp: number; pdrb_juta_rp: number; total_output_miliar_rp: number; pdrb_miliar_rp: number };
    sectors: { sector_code: string; sector_name: string; output_miliar_rp: number; va_miliar_rp: number; va_coefficient: number; bl_index: number; fl_index: number; classification: string }[];
    intra_linkage: number;
    depends_on: { province_code: string; province_name: string; linkage_strength: number }[];
    matters_to: { province_code: string; province_name: string; linkage_strength: number }[];
  }>(`/provinces/${code}`),

  getSectorDetail: (code: string) => fetchAPI<{
    sector: Sector;
    total_output_triliun_rp: number;
    total_va_triliun_rp: number;
    avg_bl_index: number;
    avg_fl_index: number;
    provinces: { province_code: string; province_name: string; region: string; output_miliar_rp: number; va_miliar_rp: number; va_coefficient: number; bl_index: number; fl_index: number; classification: string }[];
  }>(`/sectors/${code}`),

  getLinkagesPS: (provinceCode?: string) =>
    fetchAPI<LinkageItem[]>(`/linkages/province-sectors${provinceCode ? `?province_code=${provinceCode}` : ""}`),
  getLinkagesProvinces: (region?: string) =>
    fetchAPI<LinkageItem[]>(`/linkages/provinces${region ? `?region=${region}` : ""}`),
  getLinkagesSectors: () => fetchAPI<LinkageItem[]>("/linkages/sectors"),
  getLinkagesRegions: () => fetchAPI<RegionLinkage[]>("/linkages/regions"),

  getBilateral: () => fetchAPI<BilateralMatrix>("/linkages/bilateral"),
  getBilateralDetail: (a: string, b: string) =>
    fetchAPI<BilateralDetail>(`/linkages/bilateral?province_a=${a}&province_b=${b}`),

  getModelValidation: () => fetchAPI<ModelValidation>("/model/validation"),
};
