"""
Authentication routes and JWT dependency.

POST /api/auth/register  — create account, return JWT
POST /api/auth/login     — verify credentials, return JWT
Dependency: get_current_user — validates Bearer token on protected routes
"""

import logging
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.database import get_users_collection
from app.models import Token, TokenData, UserCreate, UserLogin, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


# ── JWT helpers ───────────────────────────────────────────────────────────────

def _create_access_token(user_id: str) -> str:
    """Sign a JWT containing the user's MongoDB _id."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Dependency: current user ──────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency — extracts and verifies the JWT from the Authorization header.
    Returns the raw MongoDB user document.

    Raises:
        HTTPException 401: If the token is missing, expired, or invalid.
        HTTPException 404: If the user_id in the token no longer exists.
    """
    credential_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credential_error
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credential_error

    users = get_users_collection()
    from bson import ObjectId

    try:
        user = await users.find_one({"_id": ObjectId(token_data.user_id)})
    except Exception:
        raise credential_error

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(payload: UserCreate) -> Token:
    """
    Create a new account.

    - Email must be unique.
    - Password is bcrypt-hashed before storage.
    - New users receive DEFAULT_FREE_MINUTES balance.
    - Returns a signed JWT immediately (no separate login step needed).
    """
    users = get_users_collection()

    # Check for existing account
    existing = await users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_doc = {
        "email": payload.email,
        "hashed_password": _hash_password(payload.password),
        "balance_minutes": settings.DEFAULT_FREE_MINUTES,
        "created_at": datetime.utcnow(),
    }

    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    logger.info("New user registered: %s (id=%s)", payload.email, user_id)

    return Token(access_token=_create_access_token(user_id))


@router.post("/login", response_model=Token, summary="Login with email and password")
async def login(payload: UserLogin) -> Token:
    """
    Verify credentials and return a fresh JWT.

    Raises 401 for both "email not found" and "wrong password" to avoid
    leaking which emails are registered.
    """
    invalid_creds = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password.",
    )

    users = get_users_collection()
    user = await users.find_one({"email": payload.email})

    if user is None or not _verify_password(payload.password, user["hashed_password"]):
        raise invalid_creds

    user_id = str(user["_id"])
    logger.info("User logged in: %s (id=%s)", payload.email, user_id)

    return Token(access_token=_create_access_token(user_id))


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    """Return the authenticated user's profile."""
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        balance_minutes=current_user["balance_minutes"],
        created_at=current_user["created_at"],
    )