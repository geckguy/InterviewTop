# routes/interviews.py
from fastapi import APIRouter, HTTPException
from models import InterviewExperience
from database import processed_posts_collection
from bson import ObjectId
from typing import List

router = APIRouter()

@router.get("/recent-experiences", response_model=List[InterviewExperience])
async def get_recent_experiences(limit: int = 5):
    """
    Returns the most recent interview experiences based on the date from the related posts document.
    """
    pipeline = [
        # Join with the 'posts' collection using the common field (e.g., topicId)
        {
            "$lookup": {
                "from": "posts",                    # Name of the posts collection
                "localField": "topicId",            # Field in your processed_posts collection
                "foreignField": "topicId",          # Field in the posts collection (adjust as needed)
                "as": "post_details"
            }
        },
        # Unwind the joined array so that post_details is an object rather than an array.
        {
            "$unwind": {
                "path": "$post_details",
                "preserveNullAndEmptyArrays": True  # In case there is no matching post
            }
        },
        # Sort by the date field inside the joined post_details document (most recent first)
        {
            "$sort": {"post_details.updatedAt": -1}
        },
        # Limit the number of results returned
        {
            "$limit": limit
        }
    ]

    cursor = processed_posts_collection.aggregate(pipeline)
    experiences = []
    async for doc in cursor:
        # Convert the MongoDB ObjectId to a string for frontend use.
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        experiences.append(doc)
    return experiences

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


