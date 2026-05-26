"""Legacy dashboard routes now delegate to the canonical API warehouse layer."""

from api.views import (
    dashboard_summary,
    high_risk_companies,
    ml_scores,
    risk_scores,
    top_10_companies,
)

dashboard = dashboard_summary
