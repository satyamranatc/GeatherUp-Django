from django.contrib.auth.hashers import check_password, make_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from UserApp.auth import extract_token_key, get_authenticated_user, issue_token
from UserApp.models import AuthToken, User
from UserApp.serializer import UserSerializer, UserUpdateSerializer


@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = issue_token(user)
        return Response(
            {'user': UserSerializer(user).data, 'token': token},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Please provide both email and password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Support hashed passwords and seamlessly upgrade any legacy plaintext row
    if not check_password(password, user.password):
        if user.password == password:
            user.password = make_password(password)
            user.save(update_fields=['password'])
        else:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    token = issue_token(user)
    return Response(
        {'user': UserSerializer(user).data, 'token': token},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
def logout(request):
    key = extract_token_key(request)
    if key:
        AuthToken.objects.filter(key=key).delete()
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def getProfile(request, id):
    user = User.objects.filter(id=id).first()
    if not user:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def updateProfile(request):
    auth_user = get_authenticated_user(request)
    if not auth_user:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = UserUpdateSerializer(auth_user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(auth_user).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
