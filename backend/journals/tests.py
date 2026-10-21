from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Journal

class JournalAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        self.list_url = reverse('journal_list_create')

    def test_create_journal_valid(self):
        """User bisa buat diari dengan rating valid (kelipatan 0.5)."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'tmdb_id': 550,
            'media_type': 'movie',
            'title': 'Fight Club',
            'rating': '4.5',
            'notes': 'Film mantap',
            'is_liked': True
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Journal.objects.count(), 1)

    def test_invalid_rating_value(self):
        """Rating diluar 0.5 - 5.0 atau bukan kelipatan 0.5 ditolak (HTTP 400)."""
        self.client.force_authenticate(user=self.user1)
        data = {'tmdb_id': 550, 'media_type': 'movie', 'title': 'Test', 'rating': '5.5'}
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        data['rating'] = '3.3'
        res2 = self.client.post(self.list_url, data)
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_data_isolation(self):
        """User2 tidak bisa akses/update diari User1 (HTTP 404)."""
        j1 = Journal.objects.create(
            user=self.user1, tmdb_id=550, media_type='movie',
            title='Fight Club', rating=Decimal('5.0')
        )
        detail_url = reverse('journal_detail', kwargs={'pk': j1.pk})

        self.client.force_authenticate(user=self.user2)
        res_get = self.client.get(detail_url)
        self.assertEqual(res_get.status_code, status.HTTP_404_NOT_FOUND)