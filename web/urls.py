from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="web_home"),
    path("companies/", views.companies, name="web_companies"),
    path("companies/<str:symbol>/", views.company_detail, name="web_company"),
]
