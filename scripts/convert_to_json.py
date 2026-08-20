"""Convert numpy data files to JSON for Next.js API routes."""
import json
import numpy as np
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "irio")

os.makedirs(OUT_DIR, exist_ok=True)

leontief = np.load(os.path.join(DATA_DIR, "leontief_inverse.npy"))
va_coeff = np.load(os.path.join(DATA_DIR, "va_coefficients.npy"))
output_vec = np.load(os.path.join(DATA_DIR, "output_vector.npy"))
bilateral = np.load(os.path.join(DATA_DIR, "bilateral_linkage.npy"))

# Round to reduce JSON size (6 decimal places preserves enough precision)
leontief_rounded = np.round(leontief, 6).tolist()
va_coeff_rounded = np.round(va_coeff, 8).tolist()
output_vec_rounded = np.round(output_vec, 2).tolist()
bilateral_rounded = np.round(bilateral, 6).tolist()

with open(os.path.join(OUT_DIR, "leontief.json"), "w") as f:
    json.dump(leontief_rounded, f, separators=(",", ":"))

with open(os.path.join(OUT_DIR, "va_coefficients.json"), "w") as f:
    json.dump(va_coeff_rounded, f, separators=(",", ":"))

with open(os.path.join(OUT_DIR, "output_vector.json"), "w") as f:
    json.dump(output_vec_rounded, f, separators=(",", ":"))

with open(os.path.join(OUT_DIR, "bilateral.json"), "w") as f:
    json.dump(bilateral_rounded, f, separators=(",", ":"))

# Copy JSON metadata files
for name in ["province_metadata.json", "sector_metadata.json", "province_pdrb.json",
             "province_sector_data.json", "fl_bl_data.json", "region_mapping.json",
             "bilateral_labels.json"]:
    src = os.path.join(DATA_DIR, name)
    dst = os.path.join(OUT_DIR, name)
    with open(src) as f:
        data = json.load(f)
    with open(dst, "w") as f:
        json.dump(data, f, separators=(",", ":"))

# Check output sizes
total = 0
for f in os.listdir(OUT_DIR):
    path = os.path.join(OUT_DIR, f)
    size = os.path.getsize(path)
    total += size
    print(f"  {f}: {size / 1024:.1f} KB")
print(f"  TOTAL: {total / 1024 / 1024:.1f} MB")
