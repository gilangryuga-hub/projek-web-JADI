from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/watchlist/', include('watchlists.urls')),
    path('api/journal/', include('journals.urls')),
    path('api/journals/', include('journals.urls')),
]
