# routes/share_experience.py
from fastapi import APIRouter, HTTPException
from models import InterviewExperience  # import the updated InterviewExperience model
from database import processed_posts_collection
from bson import ObjectId

router = APIRouter()

@router.post("/share-experience", response_model=InterviewExperience)
async def create_experience(experience: InterviewExperience):
    # Convert the Pydantic model to a dictionary for MongoDB insertion.
    experience_dict = experience.dict()
    
    # Insert the new document into the processed_posts collection.
    result = await processed_posts_collection.insert_one(experience_dict)
    
    # Retrieve the created document using the inserted_id.
    created_experience = await processed_posts_collection.find_one({"_id": result.inserted_id})
    if created_experience:
        # Convert the MongoDB ObjectId to a string and assign it to "id"
        created_experience["id"] = str(created_experience["_id"])
        # Optionally, remove the raw _id from the response.
        del created_experience["_id"]
        return created_experience
    
    raise HTTPException(status_code=500, detail="Experience not created")
