from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
# --- ADD missing imports ---
from datetime import timedelta, datetime
from typing import Annotated, Optional, Dict, Any, List, Set
import os # Make sure os is imported
from pydantic import BaseModel
# --- END ADD missing imports ---

# Google Auth Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests # For the request object needed by verify_oauth2_token

# Your project imports
from models import User, UserCreate, UserInDB, Token
from database import users_collection
from auth.utils import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

# --- Google Client ID from environment ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    print("WARNING: GOOGLE_CLIENT_ID environment variable not set. Google Sign-In will fail.")


# --- Pydantic model for Google token request body ---
class GoogleToken(BaseModel):
    credential: str # This holds the ID token from Google


# --- Registration Endpoint ---
@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
         raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(user_data.password)
    user_in_db = UserInDB(
        email=user_data.email,
        username=user_data.username,
        phone=None, # Explicitly set phone to None as it's removed from frontend
        hashed_password=hashed_password,
        auth_provider="email"
    )
    user_dict_to_insert = user_in_db.model_dump(exclude={"id"}, by_alias=True)
    if 'visited_posts' in user_dict_to_insert and isinstance(user_dict_to_insert['visited_posts'], set):
        user_dict_to_insert['visited_posts'] = list(user_dict_to_insert['visited_posts'])
    else:
        user_dict_to_insert['visited_posts'] = []

    try:
        result = await users_collection.insert_one(user_dict_to_insert)
    except Exception as e:
        print(f"DB Error on Register: {e}")
        raise HTTPException(status_code=500, detail="Could not create user account.")

    if not result.inserted_id:
         raise HTTPException(status_code=500, detail="User created but failed to retrieve ID.")

    created_user = User(id=str(result.inserted_id), email=user_data.email, username=user_data.username, phone=None)
    return created_user

# --- Standard Token Endpoint ---
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await authenticate_user(form_data.username, form_data.password) # Use username as email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Google Sign-In Endpoint ---
@router.post("/google", response_model=Token)
async def google_sign_in(google_token: GoogleToken):
    if not GOOGLE_CLIENT_ID:
         raise HTTPException(status_code=500, detail="Google Sign-In not configured on server.")

    token = google_token.credential
    try:
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        user_email = idinfo.get('email')
        user_name = idinfo.get('name')
        if not user_email:
             raise HTTPException(status_code=400, detail="Email not found in Google token.")

        db_user = await users_collection.find_one({"email": user_email})

        if db_user:
            user = UserInDB(**db_user)
        else:
            # Create new user
            new_username = user_name or user_email.split('@')[0]
            # Ensure username uniqueness
            existing_username_check = await users_collection.find_one({"username": new_username})
            if existing_username_check:
                 new_username = f"{new_username}_{os.urandom(3).hex()}"

            new_user_data = UserInDB(
                email=user_email,
                username=new_username,
                hashed_password=None,
                auth_provider="google",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                visited_posts=set()
            )
            user_dict_to_insert = new_user_data.model_dump(exclude={"id"}, by_alias=True)
            user_dict_to_insert['visited_posts'] = [] # Convert set to list

            insert_result = await users_collection.insert_one(user_dict_to_insert)
            if not insert_result.inserted_id:
                raise HTTPException(status_code=500, detail="Failed to create new user account from Google Sign-In.")
            user = new_user_data
            user.id = str(insert_result.inserted_id)

        # Create access token for our app
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        print(f"Google Token Verification Error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate Google credentials")
    except Exception as e:
         print(f"Google Sign-In General Error: {e}")
         raise HTTPException(status_code=500, detail="An error occurred during Google Sign-In.")

# --- Get Current User Endpoint ---
@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user