from fastapi import APIRouter, HTTPException
from .auth_models import AuthRequest, GoogleAuthRequest, OTPRequest, VerifyRequest, ResetRequest
from .auth_service import AuthService
from .auth_utils import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from config import get_settings
import sys
sys.path.append("..")
from utils.email_service import send_otp_email

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(req: AuthRequest):
    user = AuthService.create_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token}


@router.post("/login")
def login(req: AuthRequest):
    user = AuthService.authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token}


# ──── Google OAuth Endpoint ────
@router.post("/google")
def google_auth(req: GoogleAuthRequest):
    """
    Verify Google ID token and create/login user.
    """
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            req.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Check that the token is valid
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(status_code=401, detail="Invalid token issuer")

        # Extract user info from Google token
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")

        # Verify email is verified by Google
        if not idinfo.get("email_verified", False):
            raise HTTPException(status_code=400, detail="Google email not verified")

        # Create or get user
        user = AuthService.create_or_get_google_user(
            email=email,
            name=name,
            picture=picture,
            google_id=google_id
        )

        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user")

        # Generate JWT token
        token = create_access_token({"sub": email})

        return {
            "access_token": token,
            "user": {
                "email": email,
                "name": name,
                "picture": picture,
            }
        }

    except ValueError as e:
        # Token verification failed
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.post("/request-otp")
async def request_otp(req: OTPRequest):
    otp = AuthService.request_otp(req.email)

    if not otp:
        raise HTTPException(status_code=404, detail="User not found")

    await send_otp_email(req.email, otp)

    return {"message": "OTP sent"}


@router.post("/verify-otp")
def verify_otp(req: VerifyRequest):
    valid = AuthService.verify_otp(req.email, req.otp)

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = create_access_token({"sub": req.email})

    return {"access_token": token}


@router.post("/reset-password")
def reset_password(req: ResetRequest):
    AuthService.reset_password(req.email, req.password)

    return {"message": "Password updated"}