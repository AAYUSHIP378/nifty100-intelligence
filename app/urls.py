from django.urls import path
from .views import company_metrics

urlpatterns = [
    path('company-metrics/', company_metrics),
]