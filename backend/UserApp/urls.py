from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register),
    path('login', views.login),
    path('logout', views.logout),
    path('getProfile/<int:id>', views.getProfile),
    path('updateProfile', views.updateProfile),
]
