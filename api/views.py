from rest_framework.decorators import api_view
from rest_framework.response import Response

from .warehouse import filter_rows, latest_ml_scores, query_table


@api_view(["GET"])
def dashboard_summary(request):
    scores = latest_ml_scores()
    total = len(scores)
    average_score = round(sum(float(row.get("overall_score") or 0) for row in scores) / total, 2) if total else 0
    distribution = {label: 0 for label in ["EXCELLENT", "GOOD", "AVERAGE", "WEAK", "POOR"]}
    for row in scores:
        label = row.get("health_label") or "UNKNOWN"
        distribution[label] = distribution.get(label, 0) + 1
    return Response(
        {
            "total_companies": total,
            "average_score": average_score,
            "high_risk": len([row for row in scores if float(row.get("overall_score") or 0) < 50]),
            "excellent_count": len([row for row in scores if float(row.get("overall_score") or 0) >= 85]),
            "top_companies": sorted(scores, key=lambda row: row.get("overall_score") or 0, reverse=True)[:10],
            "health_distribution": distribution,
        }
    )


@api_view(["GET"])
def companies(request):
    sector = request.GET.get("sector")
    rows = query_table("dim_company")
    if sector:
        rows = [row for row in rows if row.get("sector") == sector]
    rows.sort(key=lambda row: row.get("company_name") or "")
    return Response(rows)


@api_view(["GET"])
def company_detail(request, symbol):
    symbol = symbol.upper()
    company = next((row for row in query_table("dim_company") if row.get("symbol") == symbol), None)
    if not company:
        return Response({"detail": "Company not found."}, status=404)
    latest_score = next((row for row in latest_ml_scores() if row.get("symbol") == symbol), None)
    return Response({"company": company, "latest_score": latest_score})


@api_view(["GET"])
def sectors(request):
    sectors_rows = query_table("dim_sector")
    companies = query_table("dim_company")
    scores = {row["symbol"]: row for row in latest_ml_scores()}
    payload = []
    for sector in sectors_rows:
        sector_companies = [row for row in companies if row.get("sector") == sector.get("sector_name")]
        sector_scores = [scores[row["symbol"]]["overall_score"] for row in sector_companies if row["symbol"] in scores]
        avg_score = round(sum(float(score or 0) for score in sector_scores) / len(sector_scores), 2) if sector_scores else 0
        payload.append(
            {
                "sector_id": sector.get("sector_id"),
                "sector_name": sector.get("sector_name"),
                "sector_code": sector.get("sector_code"),
                "company_count": len(sector_companies),
                "avg_health_score": avg_score,
            }
        )
    payload.sort(key=lambda row: row["sector_name"])
    return Response(payload)


@api_view(["GET"])
def financials(request, symbol):
    symbol = symbol.upper()
    pl = sorted(
        [row for row in query_table("fact_profit_loss") if row.get("symbol") == symbol],
        key=lambda row: row.get("fiscal_year") or 0,
    )
    bs = sorted(
        [row for row in query_table("fact_balance_sheet") if row.get("symbol") == symbol],
        key=lambda row: row.get("fiscal_year") or 0,
    )
    cf = sorted(
        [row for row in query_table("fact_cash_flow") if row.get("symbol") == symbol],
        key=lambda row: row.get("fiscal_year") or 0,
    )
    analysis = sorted(
        [row for row in query_table("fact_analysis") if row.get("symbol") == symbol],
        key=lambda row: row.get("period_label") or "",
    )
    return Response(
        {
            "profit_loss": pl,
            "balance_sheet": bs,
            "cash_flow": cf,
            "analysis": analysis,
        }
    )


@api_view(["GET"])
def ml_scores(request):
    sector = request.GET.get("sector")
    label = request.GET.get("label")
    rows = latest_ml_scores()
    if sector:
        rows = [row for row in rows if row.get("sector") == sector]
    if label:
        rows = [row for row in rows if row.get("health_label") == label.upper()]
    return Response(sorted(rows, key=lambda row: row.get("overall_score") or 0, reverse=True))


@api_view(["GET"])
def risk_scores(request):
    rows = [row for row in latest_ml_scores() if float(row.get("overall_score") or 0) < 50]
    return Response(sorted(rows, key=lambda row: row.get("overall_score") or 0))


@api_view(["GET"])
def top_10_companies(request):
    rows = latest_ml_scores()
    return Response(sorted(rows, key=lambda row: row.get("overall_score") or 0, reverse=True)[:10])


@api_view(["GET"])
def high_risk_companies(request):
    return risk_scores(request)


@api_view(["GET"])
def pros_cons(request, symbol):
    symbol = symbol.upper()
    rows = [row for row in query_table("fact_pros_cons") if row.get("symbol") == symbol]
    rows.sort(key=lambda row: (not row.get("is_pro"), row.get("category") or ""))
    return Response(rows)
