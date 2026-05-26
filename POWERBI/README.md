# Power BI Dashboard Pack (legacy path)

The active Power BI assets live in `../powerbi/`.

Run:

```powershell
python powerbi/export_for_powerbi.py
```

Then follow `../powerbi/BUILD_DASHBOARDS.md`.

This folder contains the seven required PBIX deliverables:

1. `01_executive_overview.pbix`
2. `02_company_deep_dive.pbix`
3. `03_sector_comparison.pbix`
4. `04_health_scorecard.pbix`
5. `05_growth_analytics.pbix`
6. `06_debt_leverage.pbix`
7. `07_dividend_returns.pbix`

Connect each report to PostgreSQL:

- Server: `localhost:5432`
- Database: `bluestock_dw`
- Tables: all `dim_*` and `fact_*` tables

Relationships to create in Power BI model view:

- `fact_profit_loss[symbol]` -> `dim_company[symbol]`
- `fact_profit_loss[year_id]` -> `dim_year[year_id]`
- `fact_balance_sheet[symbol]` -> `dim_company[symbol]`
- `fact_balance_sheet[year_id]` -> `dim_year[year_id]`
- `fact_cash_flow[symbol]` -> `dim_company[symbol]`
- `fact_cash_flow[year_id]` -> `dim_year[year_id]`
- `fact_analysis[symbol]` -> `dim_company[symbol]`
- `fact_ml_scores[symbol]` -> `dim_company[symbol]`
- `fact_pros_cons[symbol]` -> `dim_company[symbol]`
- `dim_company[sector]` -> `dim_sector[sector_name]`

Useful DAX measures:

```DAX
Total Revenue = SUM(fact_profit_loss[sales])
Total Net Profit = SUM(fact_profit_loss[net_profit])
Average OPM % = AVERAGE(fact_profit_loss[opm_pct])
Average Debt To Equity = AVERAGE(fact_balance_sheet[debt_to_equity])
Average Health Score = AVERAGE(fact_ml_scores[overall_score])
ROE Last Year = AVERAGE(dim_company[roe_pct])
ROCE = AVERAGE(dim_company[roce_pct])
Free Cash Flow = SUM(fact_cash_flow[free_cash_flow])
Cash Conversion Ratio = AVERAGE(fact_cash_flow[cash_conversion_ratio])
Interest Coverage = AVERAGE(fact_profit_loss[interest_coverage])
Net Profit Margin % = AVERAGE(fact_profit_loss[net_profit_margin_pct])
Expense Ratio % = AVERAGE(fact_profit_loss[expense_ratio_pct])
Asset Turnover = AVERAGE(fact_profit_loss[asset_turnover])
Return On Assets % = AVERAGE(fact_profit_loss[return_on_assets])

Excellent Companies =
COUNTROWS(FILTER(fact_ml_scores, fact_ml_scores[overall_score] >= 85))

Weak Or Poor Companies =
COUNTROWS(FILTER(fact_ml_scores, fact_ml_scores[overall_score] < 50))

YoY Sales Growth % =
VAR CurrentSales = [Total Revenue]
VAR CurrentYear = MAX(dim_year[fiscal_year])
VAR PreviousSales =
    CALCULATE([Total Revenue], FILTER(ALL(dim_year), dim_year[fiscal_year] = CurrentYear - 1))
RETURN DIVIDE(CurrentSales - PreviousSales, PreviousSales) * 100
```
