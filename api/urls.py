from django.urls import path
from . import views

urlpatterns = [

    path('dashboard/', views.dashboard_summary, name='dashboard'),
    path('companies/', views.companies, name='companies'),
    path('companies/<str:symbol>/', views.company_detail, name='company_detail'),
    path('companies/<str:symbol>/financials/', views.financials, name='company_financials'),
    path('companies/<str:symbol>/pros-cons/', views.pros_cons, name='company_pros_cons'),
    path('sectors/', views.sectors, name='sectors'),

    path('ml-scores/', views.ml_scores, name='ml_scores'),

    path('risk/', views.risk_scores, name='risk_scores'),

    path('top-10/', views.top_10_companies, name='top_10'),

    path('high-risk/', views.high_risk_companies, name='high_risk'),

]
