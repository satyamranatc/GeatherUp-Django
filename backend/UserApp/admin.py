from django.contrib import admin
from UserApp.models import AuthToken, User

admin.site.register(User)
admin.site.register(AuthToken)
