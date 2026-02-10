from django.urls import path

from . import views


urlpatterns = [
    path("createPost",views.createPost),
    path("allPosts",views.allPosts),
    path("postByUser/<int:user_id>",views.postByUser),

]