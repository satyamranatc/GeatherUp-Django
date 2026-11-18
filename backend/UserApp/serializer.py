from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from UserApp.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    posts_count = serializers.SerializerMethodField()
    likes_received = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'fullName',
            'avatar',
            'bio',
            'email',
            'password',
            'created_at',
            'posts_count',
            'likes_received',
        ]
        read_only_fields = ['id', 'created_at', 'posts_count', 'likes_received']

    def get_posts_count(self, obj):
        return obj.posts.count()

    def get_likes_received(self, obj):
        return sum(post.likes.count() for post in obj.posts.all())

    def create(self, validated_data):
        validated_data['email'] = validated_data['email'].strip().lower()
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'fullName', 'avatar', 'bio']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['fullName', 'avatar', 'bio']
