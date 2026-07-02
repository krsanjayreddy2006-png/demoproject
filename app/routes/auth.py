import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.utils.schemas import UserRegister
from app.utils.auth import hash_password, verify_password, create_token

router = APIRouter()

logger = logging.getLogger("finrelief.auth")



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    try:
        # Canonicalize email to avoid mismatches (case/whitespace)
        email = (user.email or "").strip().lower()

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        new_user = User(email=email, password=hash_password(user.password))
        db.add(new_user)
        db.commit()

        return {"message": "User registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/debug-user")
def debug_user(email: str, db: Session = Depends(get_db)):
    """Development helper to verify whether the user exists in the current DB.

    Returns only non-sensitive metadata.
    """
    email_canonical = (email or "").strip().lower()
    user = db.query(User).filter(User.email == email_canonical).first()
    if not user:
        return {"exists": False}

    # Don't return password hash (sensitive). Just confirm it exists/non-empty.
    return {"exists": True, "email": user.email, "has_password_hash": bool(user.password)}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        # OAuth2PasswordRequestForm uses "username" field to carry whatever the client sends.
        email = (form_data.username or "").strip().lower()
        password = form_data.password or ""

        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning("Login failed: user not found for email=%s", email)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(password, user.password):
            logger.warning("Login failed: password mismatch for email=%s", email)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Login failed with server error")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


