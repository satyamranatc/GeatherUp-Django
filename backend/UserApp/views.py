from rest_framework.decorators import api_view
from rest_framework.response import Response

from UserApp.models import User
from UserApp.serializer import UserSerializer

@api_view(['POST'])
def register(request):
    newUser = request.data
    
    mySerializer = UserSerializer(data=newUser)

    if mySerializer.is_valid():
        mySerializer.save()
        return Response(mySerializer.data)
    return Response(mySerializer.errors)


@api_view(['POST'])
def login(request):
    email = request.data.get('email', None)
    password = request.data.get('password', None)
    
    if email is None or password is None:
        return Response({'error': 'Please provide both email and password.'})
    try:
        user = User.objects.get(email=email)
        userData =  UserSerializer(user)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'})
    if user.password != password:
        return Response({'error': 'Incorrect password.'})
    return Response(userData.data)



@api_view(['GET'])
def getProfile(request,id):
    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'})
    serializer = UserSerializer(user)
    return Response(serializer.data)