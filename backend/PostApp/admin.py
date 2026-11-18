from django.contrib import admin
from .models import Comment, Like, PostModel

admin.site.register(PostModel)
admin.site.register(Like)
admin.site.register(Comment)
