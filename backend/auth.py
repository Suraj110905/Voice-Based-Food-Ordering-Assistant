from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import db
import os
from dotenv import load_dotenv

load_dotenv()

# --------- CONFIG ---------
SECRET_KEY = os.getenv("SECRET_KEY", "voicefood_secret_key_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# --------- PASSWORD HASHING ---------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --------- COLLECTIONS ---------
users_collection = db.users

# --------- HELPER FUNCTIONS ---------
def verify_password(plain_password: str, hashed_password: str):
    """Verify plain password against hashed"""
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str):
    """Hash a plain password"""
    password = password[:75]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current logged in user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await users_collection.find_one(
        {"username": username}, {"_id": 0, "password": 0}
    )
    if user is None:
        raise credentials_exception
    return user