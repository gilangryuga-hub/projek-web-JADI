from decimal import Decimal
from rest_framework import serializers
from .models import Journal

class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = [
            'id', 'tmdb_id', 'media_type', 'title', 'poster_path',
            'rating', 'notes', 'watched_date', 'is_rewatch',
            'is_liked', 'contains_spoilers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < Decimal('0.5') or value > Decimal('5.0'):
            raise serializers.ValidationError("Rating harus di antara 0.5 dan 5.0.")
        if value % Decimal('0.5') != Decimal('0'):
            raise serializers.ValidationError("Rating harus kelipatan 0.5 (misal: 3.5, 4.0).")
        return value