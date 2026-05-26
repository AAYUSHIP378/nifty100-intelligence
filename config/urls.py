from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def api_home(request):
    return JsonResponse(
        {
            "message": "N100 Financial Intelligence API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/api/docs/",
        }
    )


urlpatterns = [
    path("", include("web.urls")),
    path("api-info/", api_home, name="api_home"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("api/", include("api.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
