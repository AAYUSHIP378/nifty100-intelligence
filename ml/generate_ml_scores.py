"""
Regenerate company health scores from warehouse fact tables.
"""

from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import create_engine


def database_url() -> str:
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "bluestock_dw")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"


def score(series: pd.Series, higher_is_better: bool = True) -> pd.Series:
    values = series.replace([np.inf, -np.inf], np.nan)
    if not higher_is_better:
        values = -values
    if values.max() == values.min() or values.dropna().empty:
        return pd.Series(50.0, index=series.index)
    return ((values - values.min()) / (values.max() - values.min()) * 100).clip(0, 100).fillna(50)


def label(value: float) -> str:
    if value >= 85:
        return "EXCELLENT"
    if value >= 70:
        return "GOOD"
    if value >= 50:
        return "AVERAGE"
    if value >= 35:
        return "WEAK"
    return "POOR"


def write_csv_scores(output: pd.DataFrame) -> None:
    warehouse_dir = Path(__file__).resolve().parents[1] / "data" / "warehouse"
    warehouse_dir.mkdir(parents=True, exist_ok=True)
    path = warehouse_dir / "fact_ml_scores.csv"
    if path.exists():
        existing = pd.read_csv(path)
        combined = pd.concat([existing, output], ignore_index=True)
        combined["computed_at"] = pd.to_datetime(combined["computed_at"], errors="coerce")
        combined = combined.sort_values(["symbol", "computed_at"]).drop_duplicates("symbol", keep="last")
    else:
        combined = output
    combined.to_csv(path, index=False)
    print(f"Updated {path} with {len(output)} score rows.")


def main(argv: list[str] | None = None) -> None:
    import sys
    from pathlib import Path

    args = argv or sys.argv[1:]
    csv_only = "--csv-only" in args
    use_postgres = "--postgres" in args
    engine = create_engine(database_url()) if use_postgres else None
    warehouse_dir = Path(__file__).resolve().parents[1] / "data" / "warehouse"
    if csv_only:
        pl = pd.read_csv(warehouse_dir / "fact_profit_loss.csv")
        bs = pd.read_csv(warehouse_dir / "fact_balance_sheet.csv")
        cf = pd.read_csv(warehouse_dir / "fact_cash_flow.csv")
        analysis = pd.read_csv(warehouse_dir / "fact_analysis.csv")
    else:
        pl = pd.read_sql("SELECT * FROM fact_profit_loss", engine)
        bs = pd.read_sql("SELECT * FROM fact_balance_sheet", engine)
        cf = pd.read_sql("SELECT * FROM fact_cash_flow", engine)
        analysis = pd.read_sql("SELECT * FROM fact_analysis", engine)

    latest_year = pl["fiscal_year"].max()
    df = pl[pl["fiscal_year"].eq(latest_year)].merge(
        bs[bs["fiscal_year"].eq(latest_year)][["symbol", "debt_to_equity", "equity_ratio"]],
        on="symbol",
        how="left",
    )
    df = df.merge(
        cf[cf["fiscal_year"].eq(latest_year)][["symbol", "free_cash_flow", "cash_conversion_ratio"]],
        on="symbol",
        how="left",
    )
    df = df.merge(
        analysis[analysis["period_label"].eq("3Y")][["symbol", "compounded_sales_growth_pct", "compounded_profit_growth_pct", "roe_pct"]],
        on="symbol",
        how="left",
    )

    df["profitability_score"] = score(df["opm_pct"])
    df["growth_score"] = score(df["compounded_sales_growth_pct"].fillna(0) + df["compounded_profit_growth_pct"].fillna(0))
    df["leverage_score"] = score(df["debt_to_equity"], higher_is_better=False)
    df["cashflow_score"] = score(df["cash_conversion_ratio"].fillna(0) + df["free_cash_flow"].fillna(0))
    df["dividend_score"] = score(df["dividend_payout_pct"].fillna(0))
    df["trend_score"] = score(df["roe_pct"].fillna(0))
    df["overall_score"] = (
        df["profitability_score"] * 0.25
        + df["growth_score"] * 0.20
        + df["leverage_score"] * 0.20
        + df["cashflow_score"] * 0.15
        + df["dividend_score"] * 0.10
        + df["trend_score"] * 0.10
    ).round(2)
    df["health_label"] = df["overall_score"].apply(label)
    df["computed_at"] = pd.Timestamp.now("UTC")

    output = df[
        [
            "symbol",
            "computed_at",
            "overall_score",
            "profitability_score",
            "growth_score",
            "leverage_score",
            "cashflow_score",
            "dividend_score",
            "trend_score",
            "health_label",
        ]
    ]
    write_csv_scores(output)
    if use_postgres and engine is not None:
        output.to_sql("fact_ml_scores", engine, if_exists="append", index=False)
        print(f"Inserted {len(output)} ML score rows into PostgreSQL for fiscal year {latest_year}.")
    print(f"Generated {len(output)} ML score rows for fiscal year {latest_year}.")


if __name__ == "__main__":
    main()
