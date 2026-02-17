"""Auth dependencies for FastAPI: JWT extraction and current user."""
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from middleware.utils import decode_access_token

security = HTTPBearer(auto_error=False)


class CurrentUser:
    """Current user from JWT (id and role)."""

    def __init__(self, user_id: str, role: str):
        self.user_id = UUID(user_id)
        self.user_id_str = user_id
        self.role = role


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> CurrentUser:
    """Extract user id and role from JWT. Raises 401 if missing or invalid."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    sub = payload.get("sub")
    role = payload.get("role")
    if not sub or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return CurrentUser(user_id=sub, role=role)


def get_current_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Require current user to be admin. Use for admin-only endpoints."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
