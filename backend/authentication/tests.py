import base64

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ProfileAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="profile-user", password="password123")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("auth_me")

    def test_profile_can_be_updated_with_bio_and_avatar(self):
        image = SimpleUploadedFile(
            "avatar.png",
            base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk"
                "+A8AAQUBAScY42YAAAAASUVORK5CYII="
            ),
            content_type="image/png",
        )

        response = self.client.patch(
            self.url,
            {"bio": "Film enthusiast", "avatar": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["profile"]["bio"], "Film enthusiast")
        self.assertTrue(response.data["profile"]["avatar_url"])
