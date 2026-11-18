import secrets
from UserApp.models import AuthToken


def issue_token(user):
    """Create and return a new random auth token key for the given user."""
    key = secrets.token_hex(32)
    AuthToken.objects.create(key=key, user=user)
    return key


def extract_token_key(request):
    """Extract token key from 'Authorization: Token <key>' or 'Bearer <key>' header."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() in ('token', 'bearer'):
        return parts[1]
    return None


def get_authenticated_user(request):
    """Return the User associated with the request's Authorization token, or None."""
    key = extract_token_key(request)
    if not key:
        return None
    token = AuthToken.objects.select_related('user').filter(key=key).first()
    return token.user if token else None
