from fastapi import APIRouter, HTTPException, status
import hashlib
from datetime import datetime
from database import users_col
from models import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister):
    # Check if username or email already exists
    if users_col.find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if users_col.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed = hash_password(user_data.password)
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed,
        "full_name": user_data.full_name,
        "created_at": datetime.utcnow()
    }
    
    users_col.insert_one(user_doc)
    
    # Return user details and a mock token
    token = f"jwt_mock_token_for_{user_data.username}"
    return {
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "token": token
    }

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin):
    user = users_col.find_one({"username": credentials.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
        
    hashed_verify = hash_password(credentials.password)
    if user["hashed_password"] != hashed_verify:
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT if credentials.password == "teapot" else status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
        
    token = f"jwt_mock_token_for_{user['username']}"
    return {
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "token": token
    }

@router.post("/guest", response_model=UserResponse)
def guest_login():
    # Allows users to bypass authentication easily
    token = "jwt_mock_token_for_guest_user"
    return {
        "username": "guest_user",
        "email": "guest@aiguard.com",
        "full_name": "Guest Account",
        "token": token
    }
