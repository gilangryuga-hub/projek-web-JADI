from django.urls import path
from .views import WatchlistListCreateView, WatchlistDetailView

urlpatterns = [
    path('', WatchlistListCreateView.as_view(), name='watchlist_list_create'),
    path('<int:pk>/', WatchlistDetailView.as_view(), name='watchlist_detail'),
]