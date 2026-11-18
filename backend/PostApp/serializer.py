from rest_framework import serializers

from UserApp.serializer import UserSummarySerializer
from .models import Comment, PostModel


class CommentSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'post', 'author', 'created_at']


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostModel
        fields = ['id', 'title', 'description', 'image']


class PostViewSerializer(serializers.ModelSerializer):
    uploadedBy = UserSummarySerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = PostModel
        fields = [
            'id',
            'title',
            'description',
            'image',
            'uploadedBy',
            'created_at',
            'updated_at',
            'likes_count',
            'comments_count',
            'is_liked',
            'comments',
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        auth_user = self.context.get('auth_user')
        if not auth_user:
            return False
        return obj.likes.filter(user=auth_user).exists()
