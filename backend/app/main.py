from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.interviews import router as interviews_router
from app.routes.share_experience import router as share_experience_router
from app.routes.auth import router as auth_router

app = FastAPI(title="InterviewTop API", description="Interview Experience API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.interviewlog.top", 
        "https://interviewlog.top",
        "http://localhost:5173",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routes (no authentication required)
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Protected routes
app.include_router(
    interviews_router,
    prefix="/interviews",
    tags=["interviews"]
)

app.include_router(
    share_experience_router,
    tags=["share-experience"]
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Interview Experience API"}
