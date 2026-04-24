import os
from dotenv import load_dotenv

# Load environment variables once at startup
load_dotenv()

# --- Database ---
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise ValueError("No MONGO_URL environment variable set")

# --- Authentication ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY environment variable set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# --- Google OAuth ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    print("WARNING: GOOGLE_CLIENT_ID environment variable not set. Google Sign-In will fail.")
