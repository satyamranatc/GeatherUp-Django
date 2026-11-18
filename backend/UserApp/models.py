from django.db import models


class User(models.Model):
    fullName = models.CharField(max_length=100)
    avatar = models.TextField(blank=True, default='')
    bio = models.TextField(max_length=500, blank=True, default='')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fullName} ({self.email})"


class AuthToken(models.Model):
    key = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tokens')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token for {self.user.email}"
