import logging
from contextlib import asynccontextmanager
from dataclasses import asdict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .core.config import API_PREFIX, API_VERSION, DATA_DIR
from .models.schemas import HealthResponse, SimulationRequestSchema
from .services.irio_engine import IRIOEngine, ShockInput, SimulationRequest

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

engine = IRIOEngine(data_dir=DATA_DIR)

# In-memory scenario store (SQLite can replace later)
scenarios: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Loading IRIO engine data...")
    engine.load()
    log.info("IRIO engine ready")
    yield
    log.info("Shutting down")


app = FastAPI(
    title="SATRIO - Sistem Analisis Transaksi Regional Input-Output",
    description="API for Indonesia Inter-Regional Input-Output Analysis",
    version=API_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _result_to_dict(result) -> dict:
    d = asdict(result)
    return d


# === Health ===

@app.get(f"{API_PREFIX}/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", version=API_VERSION, model_loaded=engine._loaded)


# === Metadata ===

@app.get(f"{API_PREFIX}/metadata/provinces")
def get_provinces():
    return engine.provinces


@app.get(f"{API_PREFIX}/metadata/sectors")
def get_sectors():
    return engine.sectors


@app.get(f"{API_PREFIX}/metadata/regions")
def get_regions():
    return engine.region_mapping


@app.get(f"{API_PREFIX}/metadata/summary")
def get_summary():
    total_output = sum(p["total_output_juta_rp"] for p in engine.ps_data) / 1_000_000
    total_va = sum(p["value_added_juta_rp"] for p in engine.ps_data) / 1_000_000
    total_interactions = engine.L.shape[0] * engine.L.shape[1]
    return {
        "provinces": len(engine.provinces),
        "sectors": len(engine.sectors),
        "province_sector_nodes": len(engine.ps_data),
        "interactions": total_interactions,
        "total_output_triliun_rp": total_output,
        "total_va_triliun_rp": total_va,
        "model_year": 2016,
    }


# === Simulations ===

@app.post(f"{API_PREFIX}/simulations")
def create_simulation(req: SimulationRequestSchema):
    try:
        sim_req = SimulationRequest(
            name=req.name,
            shocks=[
                ShockInput(
                    province_code=s.province_code,
                    sector_code=s.sector_code,
                    value_billion_rp=s.value_billion_rp,
                    direction=s.direction,
                )
                for s in req.shocks
            ],
            baseline_growth=req.baseline_growth,
        )
        result = engine.simulate(sim_req)
        result_dict = _result_to_dict(result)

        # Add insight
        result_dict["insight"] = engine.generate_insight(result)

        # Add transmission flows
        result_dict["transmission_flows"] = engine.get_transmission_flows(result, top_n=15)

        # Store scenario
        scenarios[result.scenario_id] = result_dict

        return result_dict
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get(f"{API_PREFIX}/simulations/{{scenario_id}}")
def get_simulation(scenario_id: str):
    if scenario_id not in scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenarios[scenario_id]


# === Province Detail ===

@app.get(f"{API_PREFIX}/provinces/{{province_code}}")
def get_province(province_code: str):
    try:
        return engine.get_province_detail(province_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# === Sector Detail ===

@app.get(f"{API_PREFIX}/sectors/{{sector_code}}")
def get_sector(sector_code: str):
    try:
        return engine.get_sector_detail(sector_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# === Linkages ===

@app.get(f"{API_PREFIX}/linkages/province-sectors")
def get_linkages_ps(
    province_code: str | None = Query(None),
):
    return engine.get_linkages("province_sector", province_code=province_code)


@app.get(f"{API_PREFIX}/linkages/provinces")
def get_linkages_provinces(
    region: str | None = Query(None),
):
    return engine.get_linkages("province", region=region)


@app.get(f"{API_PREFIX}/linkages/sectors")
def get_linkages_sectors():
    return engine.get_linkages("sector")


@app.get(f"{API_PREFIX}/linkages/regions")
def get_linkages_regions():
    return engine.get_linkages("region")


@app.get(f"{API_PREFIX}/linkages/bilateral")
def get_bilateral(
    province_a: str | None = Query(None),
    province_b: str | None = Query(None),
):
    if province_a and province_b:
        try:
            return engine.get_bilateral_detail(province_a, province_b)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return engine.get_bilateral_matrix()


# === Validation ===

@app.get(f"{API_PREFIX}/model/validation")
def get_validation():
    return engine.get_model_validation()
