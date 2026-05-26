"""
Load transformed Nifty 100 CSVs into PostgreSQL star-schema tables.

Connection is controlled by environment variables:
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD.
"""

from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text


ROOT = Path(__file__).resolve().parents[1]
WAREHOUSE_DIR = ROOT / "data" / "warehouse"

TABLE_ORDER = [
    "dim_sector",
    "dim_health_label",
    "dim_year",
    "dim_company",
    "fact_profit_loss",
    "fact_balance_sheet",
    "fact_cash_flow",
    "fact_analysis",
    "fact_ml_scores",
    "fact_pros_cons",
]

DDL = """
CREATE TABLE IF NOT EXISTS dim_sector (
    sector_id INTEGER PRIMARY KEY,
    sector_name TEXT UNIQUE NOT NULL,
    sector_code TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS dim_health_label (
    label_id INTEGER PRIMARY KEY,
    label_name TEXT UNIQUE NOT NULL,
    min_score NUMERIC,
    max_score NUMERIC,
    color_hex TEXT
);

CREATE TABLE IF NOT EXISTS dim_year (
    year_id INTEGER PRIMARY KEY,
    year_label TEXT NOT NULL,
    fiscal_year INTEGER,
    quarter TEXT,
    is_ttm BOOLEAN DEFAULT FALSE,
    is_half_year BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    UNIQUE (year_label, fiscal_year, sort_order)
);

CREATE TABLE IF NOT EXISTS dim_company (
    symbol VARCHAR(20) PRIMARY KEY,
    company_name TEXT NOT NULL,
    sector TEXT REFERENCES dim_sector(sector_name),
    sub_sector TEXT,
    company_logo TEXT,
    website TEXT,
    nse_url TEXT,
    bse_url TEXT,
    face_value NUMERIC,
    book_value NUMERIC,
    about_company TEXT,
    roce_pct NUMERIC,
    roe_pct NUMERIC
);

CREATE TABLE IF NOT EXISTS fact_profit_loss (
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    year_id INTEGER REFERENCES dim_year(year_id),
    fiscal_year INTEGER,
    year_label TEXT,
    sales NUMERIC,
    expenses NUMERIC,
    operating_profit NUMERIC,
    opm_pct NUMERIC,
    other_income NUMERIC,
    interest NUMERIC,
    depreciation NUMERIC,
    profit_before_tax NUMERIC,
    tax_pct NUMERIC,
    net_profit NUMERIC,
    eps NUMERIC,
    dividend_payout_pct NUMERIC,
    net_profit_margin_pct NUMERIC,
    expense_ratio_pct NUMERIC,
    interest_coverage NUMERIC,
    asset_turnover NUMERIC,
    return_on_assets NUMERIC,
    PRIMARY KEY (symbol, year_id)
);

CREATE TABLE IF NOT EXISTS fact_balance_sheet (
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    year_id INTEGER REFERENCES dim_year(year_id),
    fiscal_year INTEGER,
    year_label TEXT,
    equity_capital NUMERIC,
    reserves NUMERIC,
    borrowings NUMERIC,
    other_liabilities NUMERIC,
    total_liabilities NUMERIC,
    fixed_assets NUMERIC,
    cwip NUMERIC,
    investments NUMERIC,
    other_assets NUMERIC,
    total_assets NUMERIC,
    debt_to_equity NUMERIC,
    equity_ratio NUMERIC,
    book_value_per_share NUMERIC,
    PRIMARY KEY (symbol, year_id)
);

CREATE TABLE IF NOT EXISTS fact_cash_flow (
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    year_id INTEGER REFERENCES dim_year(year_id),
    fiscal_year INTEGER,
    year_label TEXT,
    operating_activity NUMERIC,
    investing_activity NUMERIC,
    financing_activity NUMERIC,
    net_cash_flow NUMERIC,
    free_cash_flow NUMERIC,
    cash_conversion_ratio NUMERIC,
    PRIMARY KEY (symbol, year_id)
);

CREATE TABLE IF NOT EXISTS fact_analysis (
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    period_label TEXT,
    compounded_sales_growth_pct NUMERIC,
    compounded_profit_growth_pct NUMERIC,
    stock_price_cagr_pct NUMERIC,
    roe_pct NUMERIC,
    PRIMARY KEY (symbol, period_label)
);

CREATE TABLE IF NOT EXISTS fact_ml_scores (
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    computed_at TIMESTAMP,
    overall_score NUMERIC,
    profitability_score NUMERIC,
    growth_score NUMERIC,
    leverage_score NUMERIC,
    cashflow_score NUMERIC,
    dividend_score NUMERIC,
    trend_score NUMERIC,
    health_label TEXT,
    PRIMARY KEY (symbol, computed_at)
);

CREATE TABLE IF NOT EXISTS fact_pros_cons (
    insight_id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) REFERENCES dim_company(symbol),
    is_pro BOOLEAN,
    category TEXT,
    text TEXT,
    source TEXT,
    confidence NUMERIC,
    generated_at TIMESTAMP,
    UNIQUE (symbol, is_pro, text)
);
"""

UPSERT_KEYS = {
    "dim_sector": ["sector_id"],
    "dim_health_label": ["label_id"],
    "dim_year": ["year_id"],
    "dim_company": ["symbol"],
    "fact_profit_loss": ["symbol", "year_id"],
    "fact_balance_sheet": ["symbol", "year_id"],
    "fact_cash_flow": ["symbol", "year_id"],
    "fact_analysis": ["symbol", "period_label"],
    "fact_ml_scores": ["symbol", "computed_at"],
    "fact_pros_cons": ["symbol", "is_pro", "text"],
}


def database_url() -> str:
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "bluestock_dw")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"


def normalize_records(df: pd.DataFrame) -> pd.DataFrame:
    df = df.replace([float("inf"), float("-inf")], None)
    df = df.where(pd.notna(df), None)
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].replace({"inf": None, "-inf": None})
    return df


def upsert_dataframe(engine, table: str, df: pd.DataFrame) -> None:
    temp_table = f"stg_{table}"
    keys = UPSERT_KEYS[table]
    df = normalize_records(df)

    with engine.begin() as conn:
        before = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
        df.to_sql(temp_table, conn, if_exists="replace", index=False)
        columns = list(df.columns)
        quoted_cols = ", ".join(columns)
        update_cols = [col for col in columns if col not in keys]
        assignments = ", ".join([f"{col}=EXCLUDED.{col}" for col in update_cols])
        conflict = ", ".join(keys)
        query = f"""
            INSERT INTO {table} ({quoted_cols})
            SELECT {quoted_cols} FROM {temp_table}
            ON CONFLICT ({conflict}) DO UPDATE SET {assignments};
            DROP TABLE {temp_table};
        """
        conn.execute(text(query))
        after = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
    print(f"{table}: source={len(df)} before={before} after={after}")


def quality_checks(engine) -> None:
    checks = {
        "companies": "SELECT COUNT(*) FROM dim_company",
        "profit_loss_without_company": "SELECT COUNT(*) FROM fact_profit_loss f LEFT JOIN dim_company d ON f.symbol=d.symbol WHERE d.symbol IS NULL",
        "balance_without_year": "SELECT COUNT(*) FROM fact_balance_sheet WHERE year_id IS NULL",
        "cashflow_without_year": "SELECT COUNT(*) FROM fact_cash_flow WHERE year_id IS NULL",
        "ml_score_bounds": "SELECT COUNT(*) FROM fact_ml_scores WHERE overall_score < 0 OR overall_score > 100",
    }
    with engine.begin() as conn:
        for name, sql in checks.items():
            print(f"DQ {name}: {conn.execute(text(sql)).scalar_one()}")


def main() -> None:
    engine = create_engine(database_url())
    with engine.begin() as conn:
        conn.execute(text(DDL))

    for table in TABLE_ORDER:
        path = WAREHOUSE_DIR / f"{table}.csv"
        if not path.exists():
            raise FileNotFoundError(f"Missing transformed file: {path}")
        upsert_dataframe(engine, table, pd.read_csv(path))

    quality_checks(engine)
    print("Warehouse load complete.")


if __name__ == "__main__":
    main()
