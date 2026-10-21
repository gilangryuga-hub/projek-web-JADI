from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import localdate

class Journal(models.Model):
    MEDIA_TYPES = (
        ('movie', 'Movie'),
        ('tv', 'TV Series'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    tmdb_id = models.IntegerField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='movie')
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, blank=True, default='')
    rating = models.DecimalField(max_digits=3, decimal_places=1)  # 0.5 - 5.0
    notes = models.TextField(blank=True, default='')
    watched_date = models.DateField(default=localdate)
    is_rewatch = models.BooleanField(default=False)
    is_liked = models.BooleanField(default=False)
    contains_spoilers = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-watched_date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.rating}★)"