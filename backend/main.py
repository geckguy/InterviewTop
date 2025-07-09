from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routes.interviews import router as interviews_router
from routes.share_experience import router as share_experience_router
from routes.auth import router as auth_router
from auth.utils import get_current_user

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.interviewlog.top"],  # For development. In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes - these don't require authentication
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include protected routes - these require authentication
app.include_router(
    interviews_router, 
    prefix="/interviews", 
    tags=["interviews"]
)

# Include the share_experience router with authentication
app.include_router(
    share_experience_router, 
    tags=["share-experience"]
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Interview Experience API"}

