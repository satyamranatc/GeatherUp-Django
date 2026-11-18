from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from UserApp.auth import get_authenticated_user
from .models import Comment, Like, PostModel
from .serializer import CommentSerializer, PostCreateSerializer, PostViewSerializer


@api_view(['POST'])
def createPost(request):
    auth_user = get_authenticated_user(request)
    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = PostCreateSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save(uploadedBy=auth_user)
        view_serializer = PostViewSerializer(post, context={'auth_user': auth_user})
        return Response(view_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def allPosts(request):
    auth_user = get_authenticated_user(request)
    query = (request.query_params.get('q') or '').strip()

    posts = PostModel.objects.select_related('uploadedBy').prefetch_related('likes', 'comments__author')
    if query:
        posts = posts.filter(
            Q(title__icontains=query)
            | Q(description__icontains=query)
            | Q(uploadedBy__fullName__icontains=query)
        )

    serializer = PostViewSerializer(posts, many=True, context={'auth_user': auth_user})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def postByUser(request, user_id):
    auth_user = get_authenticated_user(request)
    posts = (
        PostModel.objects.filter(uploadedBy_id=user_id)
        .select_related('uploadedBy')
        .prefetch_related('likes', 'comments__author')
    )
    serializer = PostViewSerializer(posts, many=True, context={'auth_user': auth_user})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def postDetail(request, post_id):
    auth_user = get_authenticated_user(request)
    post = (
        PostModel.objects.select_related('uploadedBy')
        .prefetch_related('likes', 'comments__author')
        .filter(id=post_id)
        .first()
    )
    if not post:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PostViewSerializer(post, context={'auth_user': auth_user})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
    if post.uploadedBy_id != auth_user.id:
        return Response({'error': 'You do not have permission to modify this post.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ('PUT', 'PATCH'):
        serializer = PostCreateSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(PostViewSerializer(post, context={'auth_user': auth_user}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    post.delete()
    return Response({'message': 'Post deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def toggleLike(request, post_id):
    auth_user = get_authenticated_user(request)
    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    post = PostModel.objects.filter(id=post_id).first()
    if not post:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

    existing = Like.objects.filter(user=auth_user, post=post).first()
    if existing:
        existing.delete()
        liked = False
    else:
        Like.objects.create(user=auth_user, post=post)
        liked = True

    return Response(
        {'liked': liked, 'likes_count': post.likes.count()},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
def addComment(request, post_id):
    auth_user = get_authenticated_user(request)
    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    post = PostModel.objects.filter(id=post_id).first()
    if not post:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        comment = serializer.save(post=post, author=auth_user)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def deleteComment(request, comment_id):
    auth_user = get_authenticated_user(request)
    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    comment = Comment.objects.filter(id=comment_id).first()
    if not comment:
        return Response({'error': 'Comment not found.'}, status=status.HTTP_404_NOT_FOUND)
    if comment.author_id != auth_user.id:
        return Response({'error': 'You do not have permission to delete this comment.'}, status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response({'message': 'Comment deleted successfully.'}, status=status.HTTP_200_OK)
