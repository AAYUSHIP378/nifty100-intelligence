"""
Unified read access to the Nifty 100 star-schema warehouse.

Uses PostgreSQL when available; falls back to CSV files in data/warehouse/
so the API and web app work without Docker.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
WAREHOUSE_DIR = ROOT / "data" / "warehouse"

TABLES = {
    "dim_company",
    "dim_year",
    "dim_sector",
    "dim_health_label",
    "fact_profit_loss",
    "fact_balance_sheet",
    "fact_cash_flow",
    "fact_analysis",
    "fact_ml_scores",
    "fact_pros_cons",
}


def use_csv_fallback() -> bool:
    return os.getenv("WAREHOUSE_MODE", "auto").lower() in {"csv", "file"}


def warehouse_database_url() -> str:
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "bluestock_dw")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"


def postgres_available() -> bool:
    if use_csv_fallback():
        return False
    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(warehouse_database_url())
        with engine.connect() as conn:
            conn.execute(text("SELECT 1 FROM dim_company LIMIT 1"))
        return True
    except Exception:
        return False


@lru_cache(maxsize=1)
def _csv_frames() -> dict[str, pd.DataFrame]:
    frames: dict[str, pd.DataFrame] = {}
    for table in TABLES:
        path = WAREHOUSE_DIR / f"{table}.csv"
        if path.exists():
            frames[table] = pd.read_csv(path)
    return frames


def _records(df: pd.DataFrame) -> list[dict[str, Any]]:
    if df.empty:
        return []
    cleaned = df.replace({float("nan"): None, "nan": None})
    return cleaned.to_dict(orient="records")


def query_table(table: str) -> list[dict[str, Any]]:
    if table not in TABLES:
        raise ValueError(f"Unknown warehouse table: {table}")

    if postgres_available():
        from sqlalchemy import create_engine, text

        engine = create_engine(warehouse_database_url())
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT * FROM {table}"))
            columns = list(result.keys())
            return [dict(zip(columns, row)) for row in result.fetchall()]

    frames = _csv_frames()
    if table not in frames:
        return []
    return _records(frames[table])


def latest_ml_scores() -> list[dict[str, Any]]:
    rows = query_table("fact_ml_scores")
    if not rows:
        return []
    df = pd.DataFrame(rows)
    df["computed_at"] = pd.to_datetime(df["computed_at"], errors="coerce")
    df = df.sort_values(["symbol", "computed_at"]).drop_duplicates("symbol", keep="last")
    companies = {row["symbol"]: row for row in query_table("dim_company")}
    for record in df.to_dict(orient="records"):
        company = companies.get(record["symbol"], {})
        record["company_name"] = company.get("company_name")
        record["sector"] = company.get("sector")
    return df.to_dict(orient="records")


def filter_rows(rows: list[dict[str, Any]], **filters: Any) -> list[dict[str, Any]]:
    result = rows
    for key, value in filters.items():
        if value is None:
            continue
        result = [row for row in result if str(row.get(key, "")).upper() == str(value).upper()]
    return result
