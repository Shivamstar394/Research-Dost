from pymongo import MongoClient
from config import get_settings
from .auth_utils import hash_password, verify_password
from datetime import datetime, timedelta
from .otp_utils import generate_otp
import uuid

settings = get_settings()
client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]
users_collection = db["users"]


class AuthService:

    @staticmethod
    def create_user(email: str, password: str):
        if users_collection.find_one({"email": email}):
            return None

        user = {
            "email": email,
            "password": hash_password(password),
            "auth_provider": "email",
            "created_at": datetime.utcnow(),
        }

        users_collection.insert_one(user)
        return user

    @staticmethod
    def authenticate_user(email: str, password: str):
        user = users_collection.find_one({"email": email})
        if not user:
            return None

        # If user signed up with Google, they don't have a password
        if user.get("auth_provider") == "google" and not user.get("password"):
            return None

        if not verify_password(password, user["password"]):
            return None
        return user

    # ──── Google OAuth ────
    @staticmethod
    def create_or_get_google_user(email: str, name: str = None, picture: str = None, google_id: str = None):
        """
        Find existing user by email or create a new one for Google sign-in.
        If user exists with email/password, link the Google account.
        """
        user = users_collection.find_one({"email": email})

        if user:
            # User exists — update with Google info if not already set
            update_fields = {}
            if not user.get("google_id") and google_id:
                update_fields["google_id"] = google_id
            if not user.get("name") and name:
                update_fields["name"] = name
            if not user.get("picture") and picture:
                update_fields["picture"] = picture
            if user.get("auth_provider") == "email":
                update_fields["auth_provider"] = "email+google"

            if update_fields:
                users_collection.update_one(
                    {"email": email},
                    {"$set": update_fields}
                )

            return user

        # New user — create with Google info
        user = {
            "email": email,
            "name": name,
            "picture": picture,
            "google_id": google_id,
            "auth_provider": "google",
            "created_at": datetime.utcnow(),
            # No password for Google-only users
        }

        users_collection.insert_one(user)
        return user

    @staticmethod
    def request_otp(email: str):
        user = users_collection.find_one({"email": email})

        if not user:
            return None

        otp = generate_otp()

        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "otp": otp,
                    "otp_expiry": datetime.utcnow() + timedelta(minutes=5)
                }
            }
        )

        return otp

    @staticmethod
    def verify_otp(email: str, otp: str):
        user = users_collection.find_one({"email": email})

        if not user:
            return False

        if user.get("otp") != otp:
            return False

        if datetime.utcnow() > user.get("otp_expiry"):
            return False

        return True

    @staticmethod
    def reset_password(email: str, new_password: str):
        db_user = users_collection.find_one({"email": email})
        if not db_user:
            return False

        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "password": hash_password(new_password)
                },
                "$unset": {
                    "otp": "",
                    "otp_expiry": ""
                }
            }
        )
        return True