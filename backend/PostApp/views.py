from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializer import PostViewSerializer,PostCreateSerializer
from .models import PostModel


@api_view(['POST'])
def createPost(request):
    data = request.data
    serializer = PostCreateSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)





@api_view(['GET'])
def allPosts(request):
    data = PostModel.objects.all()
    serializer = PostViewSerializer(data, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def postByUser(request,user_id):
    pass



