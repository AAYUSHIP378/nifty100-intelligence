"""
Copy warehouse CSV files into powerbi/data for Power BI Desktop import.

Power BI Desktop steps:
1. Get Data -> Text/CSV -> select files in powerbi/data
2. Load all dim_* and fact_* tables
3. Create relationships from powerbi/relationships.json guidance
4. Paste measures from powerbi/DAX_MEASURES.dax
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WAREHOUSE = ROOT / "data" / "warehouse"
TARGET = Path(__file__).resolve().parent / "data"

RELATIONSHIPS = [
    {"from": "fact_profit_loss", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "fact_profit_loss", "fromColumn": "year_id", "to": "dim_year", "toColumn": "year_id"},
    {"from": "fact_balance_sheet", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "fact_balance_sheet", "fromColumn": "year_id", "to": "dim_year", "toColumn": "year_id"},
    {"from": "fact_cash_flow", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "fact_cash_flow", "fromColumn": "year_id", "to": "dim_year", "toColumn": "year_id"},
    {"from": "fact_analysis", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "fact_ml_scores", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "fact_pros_cons", "fromColumn": "symbol", "to": "dim_company", "toColumn": "symbol"},
    {"from": "dim_company", "fromColumn": "sector", "to": "dim_sector", "toColumn": "sector_name"},
]


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    copied = 0
    for path in sorted(WAREHOUSE.glob("*.csv")):
        shutil.copy2(path, TARGET / path.name)
        copied += 1
    (Path(__file__).parent / "relationships.json").write_text(json.dumps(RELATIONSHIPS, indent=2), encoding="utf-8")
    print(f"Copied {copied} warehouse tables to {TARGET}")


if __name__ == "__main__":
    main()
