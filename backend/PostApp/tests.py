from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class PostWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        res1 = self.client.post(
            '/api/userApp/register',
            {
                'fullName': 'Alice',
                'email': 'alice@example.com',
                'password': 'password123',
            },
            format='json',
        )
        self.token1 = res1.data['token']
        self.user1_id = res1.data['user']['id']

        res2 = self.client.post(
            '/api/userApp/register',
            {
                'fullName': 'Bob',
                'email': 'bob@example.com',
                'password': 'password123',
            },
            format='json',
        )
        self.token2 = res2.data['token']

    def test_create_list_like_comment_delete_post(self):
        # Unauthenticated create fails
        unauth = self.client.post(
            '/api/postApp/createPost',
            {'title': 'Hello', 'description': 'World', 'image': 'https://example.com/1.png'},
            format='json',
        )
        self.assertEqual(unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated create succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1}')
        created = self.client.post(
            '/api/postApp/createPost',
            {'title': 'Django Launch', 'description': 'First post!', 'image': 'https://example.com/1.png'},
            format='json',
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        post_id = created.data['id']

        # Search filter works
        feed = self.client.get('/api/postApp/allPosts?q=Django')
        self.assertEqual(feed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(feed.data), 1)

        # Like toggle
        like_res = self.client.post(f'/api/postApp/posts/{post_id}/like')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertTrue(like_res.data['liked'])
        self.assertEqual(like_res.data['likes_count'], 1)

        # Comment add
        comment_res = self.client.post(
            f'/api/postApp/posts/{post_id}/comments',
            {'text': 'Nice post!'},
            format='json',
        )
        self.assertEqual(comment_res.status_code, status.HTTP_201_CREATED)

        # Non-owner cannot delete post
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2}')
        forbidden = self.client.delete(f'/api/postApp/posts/{post_id}')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Owner can delete post
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1}')
        deleted = self.client.delete(f'/api/postApp/posts/{post_id}')
        self.assertEqual(deleted.status_code, status.HTTP_200_OK)
