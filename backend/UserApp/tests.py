from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from UserApp.models import AuthToken, User


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_payload = {
            'fullName': 'Satyam Rana',
            'email': 'satyam@example.com',
            'password': 'password123',
            'bio': 'Builder & educator',
            'avatar': 'https://example.com/avatar.png',
        }

    def test_register_hashes_password_and_returns_token(self):
        res = self.client.post('/api/userApp/register', self.user_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['email'], 'satyam@example.com')

        user = User.objects.get(email='satyam@example.com')
        self.assertNotEqual(user.password, 'password123')
        self.assertTrue(AuthToken.objects.filter(user=user).exists())

    def test_duplicate_email_rejected(self):
        self.client.post('/api/userApp/register', self.user_payload, format='json')
        res = self.client.post('/api/userApp/register', self.user_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_logout(self):
        self.client.post('/api/userApp/register', self.user_payload, format='json')

        bad_res = self.client.post(
            '/api/userApp/login',
            {'email': 'satyam@example.com', 'password': 'wrongpassword'},
            format='json',
        )
        self.assertEqual(bad_res.status_code, status.HTTP_401_UNAUTHORIZED)

        ok_res = self.client.post(
            '/api/userApp/login',
            {'email': 'satyam@example.com', 'password': 'password123'},
            format='json',
        )
        self.assertEqual(ok_res.status_code, status.HTTP_200_OK)
        token = ok_res.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        logout_res = self.client.post('/api/userApp/logout')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)
        self.assertFalse(AuthToken.objects.filter(key=token).exists())

    def test_update_profile_requires_auth(self):
        res = self.client.patch('/api/userApp/updateProfile', {'bio': 'Updated'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        reg = self.client.post('/api/userApp/register', self.user_payload, format='json')
        token = reg.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        upd = self.client.patch('/api/userApp/updateProfile', {'bio': 'Updated bio'}, format='json')
        self.assertEqual(upd.status_code, status.HTTP_200_OK)
        self.assertEqual(upd.data['bio'], 'Updated bio')
