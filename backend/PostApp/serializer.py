from rest_framework.serializers import ModelSerializer
from .models import PostModel

from UserApp.serializer import UserSerializer

class PostSerializer(ModelSerializer):
    uploadedBy = UserSerializer()
    class Meta:
        model = PostModel
        fields = '__all__'