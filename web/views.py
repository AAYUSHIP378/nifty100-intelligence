import json

from django.shortcuts import render

from api.warehouse import latest_ml_scores, query_table


def home(request):
    scores = latest_ml_scores()
    sectors = query_table("dim_sector")
    pl = query_table("fact_profit_loss")
    annual = [row for row in pl if str(row.get("year_label", "")).upper() != "TTM"]
    revenue_by_year: dict[int, float] = {}
    profit_by_year: dict[int, float] = {}
    for row in annual:
        year = row.get("fiscal_year")
        if not year:
            continue
        revenue_by_year[year] = revenue_by_year.get(year, 0) + float(row.get("sales") or 0)
        profit_by_year[year] = profit_by_year.get(year, 0) + float(row.get("net_profit") or 0)
    years = sorted(revenue_by_year.keys())[-8:]
    context = {
        "total_companies": len(query_table("dim_company")),
        "average_score": round(sum(float(row.get("overall_score") or 0) for row in scores) / len(scores), 2) if scores else 0,
        "excellent_count": len([row for row in scores if float(row.get("overall_score") or 0) >= 85]),
        "weak_count": len([row for row in scores if float(row.get("overall_score") or 0) < 50]),
        "sector_labels": json.dumps([row["sector_name"] for row in sectors]),
        "sector_counts": json.dumps(
            [
                len([company for company in query_table("dim_company") if company.get("sector") == row["sector_name"]])
                for row in sectors
            ]
        ),
        "revenue_labels": json.dumps([str(year) for year in years]),
        "revenue_values": json.dumps([round(revenue_by_year[year], 2) for year in years]),
        "profit_values": json.dumps([round(profit_by_year.get(year, 0), 2) for year in years]),
        "top_companies": sorted(scores, key=lambda row: row.get("overall_score") or 0, reverse=True)[:10],
    }
    return render(request, "web/home.html", context)


def company_detail(request, symbol):
    symbol = symbol.upper()
    company = next((row for row in query_table("dim_company") if row.get("symbol") == symbol), None)
    if not company:
        return render(request, "web/not_found.html", {"symbol": symbol}, status=404)
    pl = sorted(
        [row for row in query_table("fact_profit_loss") if row.get("symbol") == symbol and str(row.get("year_label", "")).upper() != "TTM"],
        key=lambda row: row.get("fiscal_year") or 0,
    )
    score = next((row for row in latest_ml_scores() if row.get("symbol") == symbol), None)
    pros = [row for row in query_table("fact_pros_cons") if row.get("symbol") == symbol and row.get("is_pro")]
    cons = [row for row in query_table("fact_pros_cons") if row.get("symbol") == symbol and not row.get("is_pro")]
    context = {
        "company": company,
        "score": score,
        "years": json.dumps([row.get("fiscal_year") for row in pl]),
        "sales": json.dumps([float(row.get("sales") or 0) for row in pl]),
        "net_profit": json.dumps([float(row.get("net_profit") or 0) for row in pl]),
        "opm": json.dumps([float(row.get("opm_pct") or 0) for row in pl]),
        "pros": pros,
        "cons": cons,
    }
    return render(request, "web/company.html", context)


def companies(request):
    companies_rows = query_table("dim_company")
    scores = {row["symbol"]: row for row in latest_ml_scores()}
    rows = []
    for company in companies_rows:
        score = scores.get(company["symbol"], {})
        rows.append(
            {
                "symbol": company["symbol"],
                "company_name": company["company_name"],
                "sector": company.get("sector"),
                "overall_score": score.get("overall_score"),
                "health_label": score.get("health_label"),
            }
        )
    rows.sort(key=lambda row: row.get("overall_score") or 0, reverse=True)
    return render(request, "web/companies.html", {"companies": rows})
