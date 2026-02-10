from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/userApp/',include('UserApp.urls')),
    path('api/postApp/',include('PostApp.urls')),
]
