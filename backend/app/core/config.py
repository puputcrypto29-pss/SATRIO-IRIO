from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "processed"
API_VERSION = "1.0.0"
API_PREFIX = "/api/v1"
