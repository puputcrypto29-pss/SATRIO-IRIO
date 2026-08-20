import { NextRequest, NextResponse } from "next/server";
import * as engine from "@/lib/irio-engine";

const scenarios = new Map<string, ReturnType<typeof engine.simulate>>();

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const route = path.join("/");

  try {
    if (route === "health") return json({ status: "ok", engine: "next-api" });
    if (route === "metadata/provinces") return json(engine.getProvinces());
    if (route === "metadata/sectors") return json(engine.getSectors());
    if (route === "metadata/regions") return json(engine.getRegionMapping());
    if (route === "metadata/summary") return json(engine.getSummary());

    if (route.startsWith("simulations/")) {
      const id = route.replace("simulations/", "");
      const s = scenarios.get(id);
      if (!s) return err("Scenario not found", 404);
      return json(s);
    }

    if (route.startsWith("provinces/")) {
      const code = route.replace("provinces/", "");
      return json(engine.getProvinceDetail(code));
    }

    if (route.startsWith("sectors/")) {
      const code = route.replace("sectors/", "");
      return json(engine.getSectorDetail(code));
    }

    if (route === "linkages/province-sector") {
      const url = new URL(req.url);
      const pc = url.searchParams.get("province_code") ?? undefined;
      return json(engine.getLinkages("province_sector", pc));
    }
    if (route === "linkages/provinces") return json(engine.getLinkages("province"));
    if (route === "linkages/sectors") return json(engine.getLinkages("sector"));
    if (route === "linkages/regions") return json(engine.getLinkages("region"));
    if (route === "linkages/bilateral") return json(engine.getBilateralMatrix());
    if (route === "validation") return json(engine.getModelValidation());

    return err("Not found", 404);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return err(msg, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const route = path.join("/");

  try {
    if (route === "simulations") {
      const body = await req.json();
      const name = String(body.name || "Untitled").replace(/[<>"'&]/g, "").slice(0, 100);
      const shocks = (body.shocks || []).map((s: Record<string, unknown>) => ({
        province_code: String(s.province_code),
        sector_code: String(s.sector_code),
        value_billion_rp: Number(s.value_billion_rp),
        direction: String(s.direction),
      }));
      const baselineGrowth = Number(body.baseline_growth || 0);
      const result = engine.simulate(name, shocks, baselineGrowth);
      scenarios.set(result.scenario_id, result);
      return json(result, 201);
    }
    return err("Not found", 404);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return err(msg, 500);
  }
}
