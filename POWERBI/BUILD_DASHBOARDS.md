# Power BI Dashboard Build Guide

This repository ships the warehouse data pack and DAX measures. Open Power BI Desktop and create the seven required PBIX files in this folder.

## Fast path (CSV, no PostgreSQL)

1. Run `python powerbi/export_for_powerbi.py`
2. Power BI Desktop -> **Get Data** -> **Text/CSV**
3. Import every file from `powerbi/data/`
4. Model view -> create relationships listed in `powerbi/relationships.json`
5. Paste measures from `powerbi/DAX_MEASURES.dax`
6. Save as:
   - `01_executive_overview.pbix`
   - `02_company_deep_dive.pbix`
   - `03_sector_comparison.pbix`
   - `04_health_scorecard.pbix`
   - `05_growth_analytics.pbix`
   - `06_debt_leverage.pbix`
   - `07_dividend_returns.pbix`

## PostgreSQL path (production)

1. Run `python etl/03_load_to_warehouse.py`
2. Power BI -> **Get Data** -> **PostgreSQL**
3. Server `localhost:5432`, database `bluestock_dw`
4. Import all `dim_*` and `fact_*` tables
5. Use the same relationships and DAX measures

## Page checklist

| File | Pages |
|------|-------|
| `01_executive_overview.pbix` | Market Snapshot, Sector Performance, YoY Growth Tracker |
| `02_company_deep_dive.pbix` | Financial Summary, Balance Sheet, Cash Flow, Growth & Returns |
| `03_sector_comparison.pbix` | Sector vs Sector, Companies Within Sector, Sector Trends |
| `04_health_scorecard.pbix` | Leaderboard, Scorecard Breakdown |
| `05_growth_analytics.pbix` | Revenue & Profit Growth, Margin Evolution, EPS Quality |
| `06_debt_leverage.pbix` | Leverage Snapshot, Debt Trajectory |
| `07_dividend_returns.pbix` | Dividend Analysis, Shareholder Value |

Each dashboard specification is documented in the project requirements document section 4.
