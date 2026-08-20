from pydantic import BaseModel, Field


class ShockInputSchema(BaseModel):
    province_code: str = Field(..., description="Province code (e.g. '51' for Bali)")
    sector_code: str = Field(..., description="Sector code (e.g. 'I' for Akomodasi)")
    value_billion_rp: float = Field(..., gt=0, description="Shock value in Rp billion (positive)")
    direction: str = Field(..., pattern="^(increase|decrease)$")


class SimulationRequestSchema(BaseModel):
    name: str = Field(default="Unnamed Scenario", max_length=200)
    shocks: list[ShockInputSchema] = Field(..., min_length=1, max_length=20)
    baseline_growth: float = Field(default=0.0, ge=0, le=100)


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
