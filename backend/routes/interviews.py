# routes/interviews.py
from fastapi import APIRouter, HTTPException
from models import InterviewExperience
from database import processed_posts_collection
from bson import ObjectId

router = APIRouter()

@router.get("/{id}", response_model=InterviewExperience)
async def get_interview(id: str):
    interview = await processed_posts_collection.find_one({"_id": ObjectId(id)})
    if interview:
        # Convert Mongo _id to a string:
        interview["id"] = str(interview["_id"])
        # Remove the raw _id since Pydantic model doesn't have it:
        del interview["_id"]
        return interview
    raise HTTPException(status_code=404, detail="Interview not found")


