from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Watchlist

class WatchlistAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        
        self.list_url = reverse('watchlist_list_create')

    def test_unauthenticated_access_denied(self):
        """Akses tanpa token JWT harus dilarang (HTTP 401)."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_and_get_watchlist(self):
        """User bisa tambah & ambil item watchlist sendiri."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'tmdb_id': 550,
            'media_type': 'movie',
            'title': 'Fight Club',
            'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
        }
        post_res = self.client.post(self.list_url, data)
        self.assertEqual(post_res.status_code, status.HTTP_201_CREATED)

        get_res = self.client.get(self.list_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(get_res.data), 1)

    def test_duplicate_watchlist_prevented(self):
        """Sistem cegah duplikasi film sama untuk user sama (HTTP 400)."""
        self.client.force_authenticate(user=self.user1)
        data = {'tmdb_id': 550, 'media_type': 'movie', 'title': 'Fight Club'}
        self.client.post(self.list_url, data)

        res_dup = self.client.post(self.list_url, data)
        self.assertEqual(res_dup.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_other_user_watchlist_forbidden(self):
        """User2 tidak bisa hapus watchlist milik User1 (HTTP 404)."""
        w1 = Watchlist.objects.create(user=self.user1, tmdb_id=550, media_type='movie')
        detail_url = reverse('watchlist_detail', kwargs={'pk': w1.pk})

        self.client.force_authenticate(user=self.user2)
        delete_res = self.client.delete(detail_url)
        self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)