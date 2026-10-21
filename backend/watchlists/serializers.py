from rest_framework import serializers
from .models import Watchlist

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'tmdb_id', 'media_type', 'title', 'poster_path', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user
        tmdb_id = attrs.get('tmdb_id')
        media_type = attrs.get('media_type')

        if Watchlist.objects.filter(user=user, tmdb_id=tmdb_id, media_type=media_type).exists():
            raise serializers.ValidationError("Film/Series ini sudah ada di watchlist.")
        return attrs