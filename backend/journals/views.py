from rest_framework import generics, permissions
from .models import Journal
from .serializers import JournalSerializer

class JournalListCreateView(generics.ListCreateAPIView):
    """
    GET: Ambil semua log diari film/series milik user terautentikasi.
    POST: Buat log diari baru (rating, ulasan, tanggal nonton, dsb).
    """
    serializer_class = JournalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter log diari khusus milik user login."""
        return Journal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Inject user login sebagai pemilik jurnal."""
        serializer.save(user=self.request.user)

class JournalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Ambil detail 1 log diari.
    PUT/PATCH: Update isi diari (rating, ulasan, flag rewatch/liked).
    DELETE: Hapus log diari.
    """
    serializer_class = JournalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Cegah akses/edit diari milik user lain."""
        return Journal.objects.filter(user=self.request.user)