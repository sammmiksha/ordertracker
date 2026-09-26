import os
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User

# Initialize Firebase Admin SDK
PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "ordertracker-1ae40")

if not firebase_admin._apps:
    try:
        # Default credentials or project ID init
        cred = credentials.ApplicationDefault() if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") else None
        if cred:
            firebase_admin.initialize_app(cred, {"projectId": PROJECT_ID})
        else:
            firebase_admin.initialize_app(options={"projectId": PROJECT_ID})
    except Exception as e:
        print(f"Firebase Admin initialized with project options: {e}")
        try:
            firebase_admin.initialize_app(options={"projectId": PROJECT_ID})
        except Exception:
            pass

security = HTTPBearer(auto_error=False)

async def get_current_user(
    auth_header: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Verifies Firebase ID token and ensures the user exists in PostgreSQL/SQLite.
    Primary identity is firebase_uid.
    """
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required. Please sign in."
        )

    token = auth_header.credentials

    firebase_uid = None
    phone_number = None

    # 1. Dev / Test token support
    if token.startswith("test-") or token.startswith("mock-") or token == "guest":
        firebase_uid = f"usr_{token.replace(' ', '_')}"
        raw = token.replace("test-", "").replace("mock-", "").strip()
        if raw and raw != "guest":
            phone_number = raw if raw.startswith("+") else f"+91{raw}"
        else:
            phone_number = "+919876543210"
    else:
        # 2. Genuine Firebase ID token verification
        try:
            decoded = firebase_auth.verify_id_token(token)
            firebase_uid = decoded.get("uid")
            phone_number = decoded.get("phone_number")
        except Exception as err:
            # If verification fails (e.g. expired or dev simulator), fallback gracefully
            # or raise 401 if unverified
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired Firebase authentication token: {str(err)}"
            )

    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing UID."
        )

    # 3. Retrieve or create user in PostgreSQL
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            phone_number=phone_number
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif phone_number and not user.phone_number:
        user.phone_number = phone_number
        db.commit()

    return user
