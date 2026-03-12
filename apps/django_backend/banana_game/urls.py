from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.get_urls() if hasattr(admin.site, 'get_urls') else admin.site.urls),
    path('api/', include('game.urls')),
]
