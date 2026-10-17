
from django.http import JsonResponse


def game_status(request):
    return JsonResponse({
        "coins": 200,
        "message": "Jocul este conectat la Django!"
    })
