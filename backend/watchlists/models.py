from django.db import models
from django.contrib.auth.models import User

class Watchlist(models.Model):
    MEDIA_TYPES = (
        ('movie', 'Movie'),
        ('tv', 'TV Series')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    tmdb_id = models.IntegerField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='movie')
    title = models.CharField(max_length=255, blank=True, default='')
    poster_path = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tmdb_id', 'media_type')

    def __str__(self):
        return f"{self.user.username} - {self.media_type} {self.tmdb_id}"