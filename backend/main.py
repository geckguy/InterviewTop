from fastapi import FastAPI
from routes.interviews import router as interviews_router
from routes.share_experience import router as share_experience_router

app = FastAPI()

# Include your interview routes (you can add more routers as your project grows)
app.include_router(interviews_router, prefix="/interviews", tags=["interviews"])
# Include the share_experience router.
app.include_router(share_experience_router, tags=["share-experience"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Interview Experience API"}
