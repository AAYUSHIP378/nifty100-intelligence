"""
Clean raw Nifty 100 source tables and build star-schema ready CSV files.
"""

from __future__ import annotations

import re
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
EXCEL_DIR = ROOT / "n100"
CLEAN_DIR = ROOT / "data" / "clean"
WAREHOUSE_DIR = ROOT / "data" / "warehouse"

MONTH_ORDER = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "Apr": 4,
    "May": 5,
    "Jun": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12,
}

SECTOR_OVERRIDES = {
    "ABB": ("Healthcare", "Pharmaceuticals"),
    "ADANIENSOL": ("Energy", "Power Transmission"),
    "ADANIENT": ("Holding Company", "Diversified"),
    "ADANIGREEN": ("Power", "Renewable Power"),
    "ADANIPORTS": ("Ports", "Ports and Logistics"),
    "ADANIPOWER": ("Power", "Thermal Power"),
    "AMBUJACEM": ("Cement", "Cement"),
    "APOLLOHOSP": ("Healthcare", "Hospitals"),
    "ASIANPAINT": ("Paint", "Paints"),
    "ATGL": ("Energy", "Gas Distribution"),
    "AXISBANK": ("Banking", "Private Bank"),
    "BAJAJ-AUTO": ("Auto", "Two Wheelers"),
    "BAJAJFINSV": ("NBFC", "Financial Services"),
    "BAJAJHLDNG": ("Holding Company", "Investment Holding"),
    "BAJFINANCE": ("NBFC", "Consumer Finance"),
    "BANKBARODA": ("Banking", "Public Bank"),
    "BEL": ("Holding Company", "Defence Electronics"),
    "BHARTIARTL": ("Consumer Goods", "Telecom"),
    "BHEL": ("Power", "Power Equipment"),
    "BOSCHLTD": ("Auto", "Auto Components"),
    "BPCL": ("Energy", "Oil Marketing"),
    "BRITANNIA": ("Consumer Goods", "FMCG"),
    "CANBK": ("Banking", "Public Bank"),
    "CHOLAFIN": ("NBFC", "Vehicle Finance"),
    "CIPLA": ("Healthcare", "Pharmaceuticals"),
    "COALINDIA": ("Energy", "Coal"),
    "DABUR": ("Consumer Goods", "FMCG"),
    "DIVISLAB": ("Healthcare", "Pharmaceuticals"),
    "DLF": ("Holding Company", "Real Estate"),
    "DMART": ("Consumer Goods", "Retail"),
    "DRREDDY": ("Healthcare", "Pharmaceuticals"),
    "EICHERMOT": ("Auto", "Two Wheelers"),
    "GAIL": ("Energy", "Gas Utility"),
    "GODREJCP": ("Consumer Goods", "FMCG"),
    "GRASIM": ("Cement", "Diversified Materials"),
    "HAL": ("Holding Company", "Defence Aerospace"),
    "HAVELLS": ("Consumer Goods", "Electricals"),
    "HCLTECH": ("IT", "IT Services"),
    "HDFCBANK": ("Banking", "Private Bank"),
    "HDFCLIFE": ("Insurance", "Life Insurance"),
    "HEROMOTOCO": ("Auto", "Two Wheelers"),
    "HINDALCO": ("Holding Company", "Metals"),
    "HINDUNILVR": ("Consumer Goods", "FMCG"),
    "ICICIBANK": ("Banking", "Private Bank"),
    "ICICIGI": ("Insurance", "General Insurance"),
    "ICICIPRULI": ("Insurance", "Life Insurance"),
    "INDIGO": ("Consumer Goods", "Aviation"),
    "INDUSINDBK": ("Banking", "Private Bank"),
    "INFY": ("IT", "IT Services"),
    "IOC": ("Energy", "Oil Marketing"),
    "IRCTC": ("Consumer Goods", "Travel Services"),
    "IRFC": ("NBFC", "Infrastructure Finance"),
    "ITC": ("Consumer Goods", "FMCG"),
    "JINDALSTEL": ("Holding Company", "Metals"),
    "JIOFIN": ("NBFC", "Financial Services"),
    "JSWENERGY": ("Power", "Power Generation"),
    "JSWSTEEL": ("Holding Company", "Metals"),
    "KOTAKBANK": ("Banking", "Private Bank"),
    "LICI": ("Insurance", "Life Insurance"),
    "LODHA": ("Holding Company", "Real Estate"),
    "LT": ("Holding Company", "Engineering and Construction"),
    "LTIM": ("IT", "IT Services"),
    "M&M": ("Auto", "Passenger and Commercial Vehicles"),
    "MARUTI": ("Auto", "Passenger Vehicles"),
    "MOTHERSON": ("Auto", "Auto Components"),
    "NAUKRI": ("IT", "Internet Services"),
    "NESTLEIND": ("Consumer Goods", "FMCG"),
    "NHPC": ("Power", "Hydro Power"),
    "NTPC": ("Power", "Power Generation"),
    "ONGC": ("Energy", "Oil and Gas Exploration"),
    "PFC": ("NBFC", "Power Finance"),
    "PIDILITIND": ("Consumer Goods", "Specialty Chemicals"),
    "PNB": ("Banking", "Public Bank"),
    "POWERGRID": ("Power", "Power Transmission"),
    "RECLTD": ("NBFC", "Power Finance"),
    "RELIANCE": ("Energy", "Diversified Energy"),
    "SBILIFE": ("Insurance", "Life Insurance"),
    "SBIN": ("Banking", "Public Bank"),
    "SHREECEM": ("Cement", "Cement"),
    "SHRIRAMFIN": ("NBFC", "Vehicle Finance"),
    "SIEMENS": ("Power", "Industrial Automation"),
    "SUNPHARMA": ("Healthcare", "Pharmaceuticals"),
    "TATACONSUM": ("Consumer Goods", "FMCG"),
    "TATAMOTORS": ("Auto", "Passenger and Commercial Vehicles"),
    "TATAPOWER": ("Power", "Power Utility"),
    "TATASTEEL": ("Holding Company", "Metals"),
    "TCS": ("IT", "IT Services"),
    "TECHM": ("IT", "IT Services"),
    "TITAN": ("Consumer Goods", "Jewellery and Retail"),
    "TORNTPHARM": ("Healthcare", "Pharmaceuticals"),
    "TRENT": ("Consumer Goods", "Retail"),
    "TVSMOTOR": ("Auto", "Two Wheelers"),
    "ULTRACEMCO": ("Cement", "Cement"),
    "UNIONBANK": ("Banking", "Public Bank"),
    "UNITDSPR": ("Consumer Goods", "Alcoholic Beverages"),
    "VBL": ("Consumer Goods", "Beverages"),
    "VEDL": ("Holding Company", "Metals"),
    "WIPRO": ("IT", "IT Services"),
    "ZOMATO": ("Consumer Goods", "Internet Food Services"),
    "ZYDUSLIFE": ("Healthcare", "Pharmaceuticals"),
}


def read_table(table: str) -> pd.DataFrame:
    csv_path = RAW_DIR / f"{table}.csv"
    if csv_path.exists():
        return pd.read_csv(csv_path)
    excel_path = EXCEL_DIR / f"{table}.xlsx"
    df = pd.read_excel(excel_path)
    first_col = str(df.columns[0])
    if not df.empty and (first_col.startswith("Unnamed") or "records" in first_col.lower()):
        df.columns = df.iloc[0]
        df = df.iloc[1:].reset_index(drop=True)
    return df


def clean_common(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(col).strip() for col in df.columns]
    df = df.replace(["NULL", "Null", "null", ""], np.nan)
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]) or pd.api.types.is_bool_dtype(df[col]):
            continue
        df[col] = df[col].astype(str).str.replace("\r", " ", regex=False).str.replace("\n", " ", regex=False).str.strip()
        df[col] = df[col].replace({"nan": np.nan, "None": np.nan})
    return df


def to_number(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "", regex=False).str.replace("%", "", regex=False),
        errors="coerce",
    )


def safe_divide(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    denominator = denominator.replace({0: np.nan})
    return numerator / denominator


def standardize_year(value: object) -> pd.Series:
    if pd.isna(value):
        return pd.Series({"year_label": np.nan, "fiscal_year": np.nan, "quarter": np.nan, "is_ttm": False, "is_half_year": False, "sort_order": np.nan})
    text = str(value).strip()
    if text.upper() == "TTM":
        return pd.Series({"year_label": "TTM", "fiscal_year": np.nan, "quarter": "TTM", "is_ttm": True, "is_half_year": False, "sort_order": 999999})

    match = re.search(r"([A-Za-z]{3})[\s-]*(\d{2,4})", text)
    if not match:
        return pd.Series({"year_label": text, "fiscal_year": np.nan, "quarter": np.nan, "is_ttm": False, "is_half_year": False, "sort_order": np.nan})
    month = match.group(1).title()
    year = int(match.group(2))
    if year < 100:
        year += 2000
    month_no = MONTH_ORDER.get(month, 3)
    quarter = "Q4" if month_no == 3 else "Q2" if month_no == 9 else f"Q{((month_no - 1) // 3) + 1}"
    return pd.Series(
        {
            "year_label": f"{month} {year}",
            "fiscal_year": year,
            "quarter": quarter,
            "is_ttm": False,
            "is_half_year": month_no == 9,
            "sort_order": year * 10 + month_no,
        }
    )


def add_year_columns(df: pd.DataFrame) -> pd.DataFrame:
    if "year" not in df.columns:
        return df
    year_cols = df["year"].apply(standardize_year)
    return pd.concat([df.drop(columns=[col for col in year_cols.columns if col in df.columns]), year_cols], axis=1)


def normalize_symbol(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "symbol" not in df.columns:
        if "company_id" in df.columns:
            df = df.rename(columns={"company_id": "symbol"})
        elif "id" in df.columns:
            df = df.rename(columns={"id": "symbol"})
    df["symbol"] = df["symbol"].astype(str).str.strip().str.upper()
    df["symbol"] = df["symbol"].replace({"AGTL": "ATGL"})
    return df


def parse_pct(text: object) -> float:
    if pd.isna(text):
        return np.nan
    match = re.search(r"(-?\d+(?:\.\d+)?)\s*%", str(text).replace(",", ""))
    return float(match.group(1)) if match else np.nan


def parse_period(text: object) -> str:
    raw = "" if pd.isna(text) else str(text).upper()
    if "TTM" in raw:
        return "TTM"
    if "10 YEAR" in raw or raw.strip().startswith("10"):
        return "10Y"
    if "5 YEAR" in raw or raw.strip().startswith("5"):
        return "5Y"
    if "3 YEAR" in raw or raw.strip().startswith("3"):
        return "3Y"
    if "1 YEAR" in raw or "LAST YEAR" in raw:
        return "1Y"
    return str(text).split(":")[0].strip() or "UNKNOWN"


def health_label(score: float) -> str:
    if pd.isna(score):
        return "UNKNOWN"
    if score >= 85:
        return "EXCELLENT"
    if score >= 70:
        return "GOOD"
    if score >= 50:
        return "AVERAGE"
    if score >= 35:
        return "WEAK"
    return "POOR"


def minmax_score(series: pd.Series, higher_is_better: bool = True) -> pd.Series:
    values = series.replace([np.inf, -np.inf], np.nan)
    if not higher_is_better:
        values = -values
    min_value = values.min()
    max_value = values.max()
    if pd.isna(min_value) or pd.isna(max_value) or min_value == max_value:
        return pd.Series(50, index=series.index, dtype=float)
    return ((values - min_value) / (max_value - min_value) * 100).clip(0, 100).fillna(50)


def build_ml_scores(company: pd.DataFrame, pl: pd.DataFrame, bs: pd.DataFrame, cf: pd.DataFrame, analysis: pd.DataFrame) -> pd.DataFrame:
    latest_pl = (
        pl[pl["is_ttm"].eq(False)]
        .sort_values(["symbol", "sort_order", "year_id"])
        .drop_duplicates("symbol", keep="last")
        .copy()
    )
    latest_bs = (
        bs[bs["is_ttm"].eq(False)]
        .sort_values(["symbol", "sort_order", "year_id"])
        .drop_duplicates("symbol", keep="last")
        .copy()
    )
    latest_cf = (
        cf[cf["is_ttm"].eq(False)]
        .sort_values(["symbol", "sort_order", "year_id"])
        .drop_duplicates("symbol", keep="last")
        .copy()
    )

    df = latest_pl.merge(latest_bs[["symbol", "debt_to_equity", "equity_ratio"]], on="symbol", how="left", suffixes=("", "_bs"))
    df = df.merge(latest_cf[["symbol", "operating_activity", "free_cash_flow", "cash_conversion_ratio"]], on="symbol", how="left")
    df = df.merge(company[["symbol", "company_name", "sector"]], on="symbol", how="left")

    sales_3y = (
        analysis[analysis["period_label"].eq("3Y")][["symbol", "compounded_sales_growth_pct", "compounded_profit_growth_pct", "roe_pct"]]
        .drop_duplicates("symbol", keep="last")
    )
    df = df.merge(sales_3y, on="symbol", how="left")

    profitability_base = df["opm_pct"] if "opm_pct" in df.columns else pd.Series(np.nan, index=df.index)
    df["profitability_score"] = minmax_score(profitability_base)
    df["growth_score"] = minmax_score(df["compounded_sales_growth_pct"].fillna(0) + df["compounded_profit_growth_pct"].fillna(0))
    df["leverage_score"] = minmax_score(df["debt_to_equity"], higher_is_better=False)
    df["cashflow_score"] = minmax_score(df["cash_conversion_ratio"].fillna(0) + df["free_cash_flow"].fillna(0))
    df["dividend_score"] = minmax_score(df["dividend_payout_pct"].fillna(0))
    df["trend_score"] = minmax_score(df["roe_pct"].fillna(0))
    df["overall_score"] = (
        df["profitability_score"] * 0.25
        + df["growth_score"] * 0.20
        + df["leverage_score"] * 0.20
        + df["cashflow_score"] * 0.15
        + df["dividend_score"] * 0.10
        + df["trend_score"] * 0.10
    ).round(2)
    df["health_label"] = df["overall_score"].apply(health_label)
    df["computed_at"] = pd.Timestamp.now("UTC").strftime("%Y-%m-%d %H:%M:%S")

    return df[
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


def main() -> None:
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)
    WAREHOUSE_DIR.mkdir(parents=True, exist_ok=True)

    companies = normalize_symbol(clean_common(read_table("companies")))
    companies["company_name"] = companies["company_name"].astype(str).str.strip()
    companies["sector"] = companies["symbol"].map(lambda symbol: SECTOR_OVERRIDES.get(symbol, ("Consumer Goods", "Other"))[0])
    companies["sub_sector"] = companies["symbol"].map(lambda symbol: SECTOR_OVERRIDES.get(symbol, ("Consumer Goods", "Other"))[1])
    companies = companies.rename(
        columns={
            "company_logo": "company_logo",
            "nse_profile": "nse_url",
            "bse_profile": "bse_url",
            "roce_percentage": "roce_pct",
            "roe_percentage": "roe_pct",
        }
    )

    pl = normalize_symbol(clean_common(read_table("profitandloss")))
    pl = add_year_columns(pl)
    pl = pl.rename(columns={"opm_percentage": "opm_pct", "tax_percentage": "tax_pct", "dividend_payout": "dividend_payout_pct"})
    for col in ["sales", "expenses", "operating_profit", "opm_pct", "other_income", "interest", "depreciation", "profit_before_tax", "tax_pct", "net_profit", "eps", "dividend_payout_pct"]:
        if col in pl.columns:
            pl[col] = to_number(pl[col])
    pl["net_profit_margin_pct"] = safe_divide(pl["net_profit"], pl["sales"]) * 100
    pl["expense_ratio_pct"] = safe_divide(pl["expenses"], pl["sales"]) * 100
    pl["interest_coverage"] = safe_divide(pl["operating_profit"], pl["interest"])

    bs = normalize_symbol(clean_common(read_table("balancesheet")))
    bs = add_year_columns(bs)
    bs = bs.rename(columns={"other_asset": "other_assets"})
    for col in ["equity_capital", "reserves", "borrowings", "other_liabilities", "total_liabilities", "fixed_assets", "cwip", "investments", "other_assets", "total_assets"]:
        if col in bs.columns:
            bs[col] = to_number(bs[col])
    equity = bs["equity_capital"] + bs["reserves"]
    bs["debt_to_equity"] = safe_divide(bs["borrowings"], equity)
    bs["equity_ratio"] = safe_divide(equity, bs["total_assets"])
    bs["book_value_per_share"] = np.nan

    cf = normalize_symbol(clean_common(read_table("cashflow")))
    cf = add_year_columns(cf)
    for col in ["operating_activity", "investing_activity", "financing_activity", "net_cash_flow"]:
        if col in cf.columns:
            cf[col] = to_number(cf[col])
    cf["free_cash_flow"] = cf["operating_activity"] + cf["investing_activity"]

    pl_bs = pl[["symbol", "fiscal_year", "sales", "net_profit"]].merge(
        bs[["symbol", "fiscal_year", "total_assets"]], on=["symbol", "fiscal_year"], how="left"
    )
    pl_bs["asset_turnover"] = safe_divide(pl_bs["sales"], pl_bs["total_assets"])
    pl_bs["return_on_assets"] = safe_divide(pl_bs["net_profit"], pl_bs["total_assets"]) * 100
    pl = pl.merge(pl_bs[["symbol", "fiscal_year", "asset_turnover", "return_on_assets"]], on=["symbol", "fiscal_year"], how="left")

    cf = cf.merge(pl[["symbol", "fiscal_year", "net_profit"]], on=["symbol", "fiscal_year"], how="left")
    cf["cash_conversion_ratio"] = safe_divide(cf["operating_activity"], cf["net_profit"])

    analysis_raw = normalize_symbol(clean_common(read_table("analysis")))
    analysis = pd.DataFrame(
        {
            "symbol": analysis_raw["symbol"],
            "period_label": analysis_raw["compounded_sales_growth"].apply(parse_period),
            "compounded_sales_growth_pct": analysis_raw["compounded_sales_growth"].apply(parse_pct),
            "compounded_profit_growth_pct": analysis_raw["compounded_profit_growth"].apply(parse_pct),
            "stock_price_cagr_pct": analysis_raw["stock_price_cagr"].apply(parse_pct),
            "roe_pct": analysis_raw["roe"].apply(parse_pct),
        }
    )

    all_symbols = sorted(set(companies["symbol"]) | set(pl["symbol"]) | set(bs["symbol"]) | set(cf["symbol"]) | set(analysis["symbol"]))
    missing_symbols = [symbol for symbol in all_symbols if symbol not in set(companies["symbol"])]
    if missing_symbols:
        fallback_companies = pd.DataFrame({"symbol": missing_symbols})
        fallback_companies["company_name"] = fallback_companies["symbol"]
        fallback_companies["sector"] = fallback_companies["symbol"].map(lambda symbol: SECTOR_OVERRIDES.get(symbol, ("Consumer Goods", "Other"))[0])
        fallback_companies["sub_sector"] = fallback_companies["symbol"].map(lambda symbol: SECTOR_OVERRIDES.get(symbol, ("Consumer Goods", "Other"))[1])
        for col in ["company_logo", "website", "nse_url", "bse_url", "face_value", "book_value", "about_company", "roce_pct", "roe_pct"]:
            fallback_companies[col] = np.nan
        companies = pd.concat([companies, fallback_companies], ignore_index=True, sort=False)

    pros_raw = normalize_symbol(clean_common(read_table("prosandcons")))
    pros = pd.concat(
        [
            pros_raw[["symbol", "pros"]].rename(columns={"pros": "text"}).assign(is_pro=True, category="Strength"),
            pros_raw[["symbol", "cons"]].rename(columns={"cons": "text"}).assign(is_pro=False, category="Risk"),
        ],
        ignore_index=True,
    )
    pros = pros.dropna(subset=["text"])
    pros["source"] = "MANUAL"
    pros["confidence"] = 1.0
    pros["generated_at"] = pd.Timestamp.now("UTC").strftime("%Y-%m-%d %H:%M:%S")

    documents = normalize_symbol(clean_common(read_table("documents")))
    documents = add_year_columns(documents) if "year" in documents.columns else documents

    years = pd.concat(
        [
            pl[["year_label", "fiscal_year", "quarter", "is_ttm", "is_half_year", "sort_order"]],
            bs[["year_label", "fiscal_year", "quarter", "is_ttm", "is_half_year", "sort_order"]],
            cf[["year_label", "fiscal_year", "quarter", "is_ttm", "is_half_year", "sort_order"]],
        ],
        ignore_index=True,
    ).drop_duplicates().sort_values("sort_order")
    years.insert(0, "year_id", range(1, len(years) + 1))

    def attach_year_id(df: pd.DataFrame) -> pd.DataFrame:
        return df.merge(years[["year_id", "year_label", "fiscal_year", "sort_order"]], on=["year_label", "fiscal_year", "sort_order"], how="left")

    pl = attach_year_id(pl)
    bs = attach_year_id(bs)
    cf = attach_year_id(cf)
    pl = pl.sort_values(["symbol", "sort_order", "year_id"]).drop_duplicates(["symbol", "year_id"], keep="last")
    bs = bs.sort_values(["symbol", "sort_order", "year_id"]).drop_duplicates(["symbol", "year_id"], keep="last")
    cf = cf.sort_values(["symbol", "sort_order", "year_id"]).drop_duplicates(["symbol", "year_id"], keep="last")
    if {"year_label", "fiscal_year", "sort_order"}.issubset(documents.columns):
        documents = attach_year_id(documents)

    sector_names = sorted(companies["sector"].dropna().unique())
    sectors = pd.DataFrame(
        {
            "sector_id": range(1, len(sector_names) + 1),
            "sector_name": sector_names,
            "sector_code": [re.sub(r"[^A-Z0-9]", "", name.upper())[:12] for name in sector_names],
            "description": [f"Nifty 100 {name} companies" for name in sector_names],
        }
    )
    health_labels = pd.DataFrame(
        [
            (1, "EXCELLENT", 85, 100, "#17803A"),
            (2, "GOOD", 70, 84.99, "#6BBF59"),
            (3, "AVERAGE", 50, 69.99, "#F4C542"),
            (4, "WEAK", 35, 49.99, "#F97316"),
            (5, "POOR", 0, 34.99, "#DC2626"),
        ],
        columns=["label_id", "label_name", "min_score", "max_score", "color_hex"],
    )

    ml_scores = build_ml_scores(companies, pl, bs, cf, analysis)

    # Raw cleaned copies for auditability.
    companies.to_csv(CLEAN_DIR / "companies_clean.csv", index=False)
    pl.to_csv(CLEAN_DIR / "profitloss_clean.csv", index=False)
    bs.to_csv(CLEAN_DIR / "balancesheet_clean.csv", index=False)
    cf.to_csv(CLEAN_DIR / "cashflow_clean.csv", index=False)
    analysis.to_csv(CLEAN_DIR / "analysis_clean.csv", index=False)
    pros.to_csv(CLEAN_DIR / "proscons_clean.csv", index=False)
    documents.to_csv(CLEAN_DIR / "documents_clean.csv", index=False)
    companies[["symbol", "company_name", "sector", "sub_sector"]].to_csv(ROOT / "data" / "sector_mapping.csv", index=False)

    dim_company_cols = ["symbol", "company_name", "sector", "sub_sector", "company_logo", "website", "nse_url", "bse_url", "face_value", "book_value", "about_company", "roce_pct", "roe_pct"]
    companies[[col for col in dim_company_cols if col in companies.columns]].to_csv(WAREHOUSE_DIR / "dim_company.csv", index=False)
    years.to_csv(WAREHOUSE_DIR / "dim_year.csv", index=False)
    sectors.to_csv(WAREHOUSE_DIR / "dim_sector.csv", index=False)
    health_labels.to_csv(WAREHOUSE_DIR / "dim_health_label.csv", index=False)
    pl_cols = [
        "symbol", "year_id", "fiscal_year", "year_label", "sales", "expenses",
        "operating_profit", "opm_pct", "other_income", "interest", "depreciation",
        "profit_before_tax", "tax_pct", "net_profit", "eps", "dividend_payout_pct",
        "net_profit_margin_pct", "expense_ratio_pct", "interest_coverage",
        "asset_turnover", "return_on_assets",
    ]
    bs_cols = [
        "symbol", "year_id", "fiscal_year", "year_label", "equity_capital",
        "reserves", "borrowings", "other_liabilities", "total_liabilities",
        "fixed_assets", "cwip", "investments", "other_assets", "total_assets",
        "debt_to_equity", "equity_ratio", "book_value_per_share",
    ]
    cf_cols = [
        "symbol", "year_id", "fiscal_year", "year_label", "operating_activity",
        "investing_activity", "financing_activity", "net_cash_flow",
        "free_cash_flow", "cash_conversion_ratio",
    ]
    pl[[col for col in pl_cols if col in pl.columns]].to_csv(WAREHOUSE_DIR / "fact_profit_loss.csv", index=False)
    bs[[col for col in bs_cols if col in bs.columns]].to_csv(WAREHOUSE_DIR / "fact_balance_sheet.csv", index=False)
    cf[[col for col in cf_cols if col in cf.columns]].to_csv(WAREHOUSE_DIR / "fact_cash_flow.csv", index=False)
    analysis.to_csv(WAREHOUSE_DIR / "fact_analysis.csv", index=False)
    ml_scores.to_csv(WAREHOUSE_DIR / "fact_ml_scores.csv", index=False)
    pros.to_csv(WAREHOUSE_DIR / "fact_pros_cons.csv", index=False)

    for path in sorted(WAREHOUSE_DIR.glob("*.csv")):
        print(f"{path.name}: {len(pd.read_csv(path))} rows")
    print("Clean transform complete.")


if __name__ == "__main__":
    main()
