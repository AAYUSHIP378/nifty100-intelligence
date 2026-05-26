from django.urls import path
from . import views

urlpatterns = [

    # Main Dashboard API
    path('dashboard/', views.dashboard, name='dashboard'),

    # ML Scores
    path('ml-scores/', views.ml_scores, name='ml_scores'),

    # Risk Scores
    path('risk-scores/', views.risk_scores, name='risk_scores'),

    # Top Companies
    path('top-companies/', views.top_10_companies, name='top_companies'),

    # High Risk Companies
    path('high-risk/', views.high_risk_companies, name='high_risk_companies'),

    # Top 10 Companies (same API)
    path('top-10/', views.top_10_companies, name='top_10_companies'),
]