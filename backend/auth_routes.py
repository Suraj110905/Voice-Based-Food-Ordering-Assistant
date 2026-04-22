from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    users_collection
)
from datetime import datetime

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# --------- MODELS ---------
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --------- REGISTER ---------
@auth_router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user"""

    # Check if username exists
    existing = await users_collection.find_one(
        {"username": request.username}
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists!"
        )

    # Check if email exists
    existing_email = await users_collection.find_one(
        {"email": request.email}
    )
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered!"
        )

    # Create new user
    user = {
        "username": request.username,
        "email": request.email,
        "password": hash_password(request.password),
        "full_name": request.full_name,
        "created_at": datetime.now().isoformat(),
    }
    await users_collection.insert_one(user)

    # Create token
    token = create_access_token({"sub": request.username})

    return {
        "message": f"Welcome {request.full_name}! Account created successfully!",
        "token": token,
        "username": request.username,
        "full_name": request.full_name,
        "email": request.email,
    }

# --------- LOGIN ---------
@auth_router.post("/login")
async def login(request: LoginRequest):
    """Login with username and password"""

    # Find user
    user = await users_collection.find_one(
        {"username": request.username}
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password!"
        )

    # Verify password
    if not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password!"
        )

    # Create token
    token = create_access_token({"sub": request.username})

    return {
        "message": f"Welcome back {user['full_name']}!",
        "token": token,
        "username": user["username"],
        "full_name": user["full_name"],
        "email": user["email"],
    }

# --------- GET PROFILE ---------
@auth_router.get("/profile")
async def get_profile(username: str):
    """Get user profile"""
    user = await users_collection.find_one(
        {"username": username},
        {"_id": 0, "password": 0}
    )
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found!"
        )
    return user