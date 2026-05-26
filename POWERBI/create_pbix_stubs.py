"""
Create PBIX placeholder files with build instructions embedded as metadata.

Power BI Desktop must open a valid PBIX; use BUILD_DASHBOARDS.md to create
production reports, then replace these placeholders.
"""

from pathlib import Path

DASHBOARDS = [
    "01_executive_overview",
    "02_company_deep_dive",
    "03_sector_comparison",
    "04_health_scorecard",
    "05_growth_analytics",
    "06_debt_leverage",
    "07_dividend_returns",
]

README = """Nifty 100 Power BI Dashboard Placeholder
=========================================
Import data from powerbi/data/ (run export_for_powerbi.py first).
Follow powerbi/BUILD_DASHBOARDS.md and paste measures from DAX_MEASURES.dax.
Save this file as a real .pbix from Power BI Desktop.
"""


def main() -> None:
    folder = Path(__file__).resolve().parent
    for name in DASHBOARDS:
        path = folder / f"{name}.pbix.readme"
        path.write_text(README + f"\nDashboard: {name}\n", encoding="utf-8")
    print("Created PBIX build readme stubs. Build real PBIX files in Power BI Desktop.")


if __name__ == "__main__":
    main()
