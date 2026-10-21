from rest_framework import generics, permissions
from .models import Watchlist
from .serializers import WatchlistSerializer

class WatchlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter data watchlist hanya untuk user terautentikasi."""
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Inject user yang sedang login ke instance Watchlist baru."""
        serializer.save(user=self.request.user)

class WatchlistDetailView(generics.DestroyAPIView):
    """
    DELETE: Hapus item watchlist spesifik berdasarkan ID unik instance.
    """
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Cegah user menghapus watchlist milik user lain."""
        return Watchlist.objects.filter(user=self.request.user)