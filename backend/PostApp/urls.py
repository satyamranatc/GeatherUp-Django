from django.urls import path
from . import views

urlpatterns = [
    path('createPost', views.createPost),
    path('allPosts', views.allPosts),
    path('postByUser/<int:user_id>', views.postByUser),
    path('posts/<int:post_id>', views.postDetail),
    path('posts/<int:post_id>/like', views.toggleLike),
    path('posts/<int:post_id>/comments', views.addComment),
    path('comments/<int:comment_id>', views.deleteComment),
]
