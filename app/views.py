from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def company_metrics(request):
    data = {
        "total_companies": 100,
        "avg_roe": 18.5,
        "excellent_health": 32,
        "weak_health": 12,
    }

    return Response(data)