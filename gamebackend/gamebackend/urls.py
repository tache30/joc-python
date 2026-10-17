
from django.contrib import admin
from django.urls import path

from game.views import game_status

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', game_status, name='game_status'),
]

