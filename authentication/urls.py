from django.urls import path

from .views import (
    register_user,
    auth_health_check
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path('', auth_health_check),

    path('register/', register_user),

    path('login/', TokenObtainPairView.as_view()),

    path('refresh/', TokenRefreshView.as_view()),
]