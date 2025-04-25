# --- START OF FILE share_experience.py ---

from fastapi import APIRouter, HTTPException, Depends, status # Added Depends, status
from models import InterviewExperience, User # Added User
from database import shared_experiences_collection # Changed to new collection
from auth.utils import get_current_user # Added auth dependency
from datetime import datetime # Added datetime

router = APIRouter()

@router.post("/share-experience", response_model=InterviewExperience, status_code=status.HTTP_201_CREATED) # Added status_code
async def create_experience(exp: InterviewExperience, current_user: User = Depends(get_current_user)):
    # Dump as JSON mode so HttpUrl fields become plain strings
    # Also exclude 'id' as it's generated, and exclude unset fields
    exp_dict = exp.model_dump(mode="json", by_alias=True, exclude_unset=True, exclude={"id"})

    # Ensure any HttpUrl in lists are strings (safer)
    if "problem_link" in exp_dict and isinstance(exp_dict["problem_link"], list):
        exp_dict["problem_link"] = [str(url) for url in exp_dict["problem_link"]]
    elif "problem_link" in exp_dict: # If it's not a list for some reason, clear it
         del exp_dict["problem_link"]

    # Add metadata for the submission
    exp_dict["submittedByUserId"] = current_user.id # Store user ID (optional, for tracking)
    exp_dict["createdAt"] = datetime.utcnow() # Set creation time on the server
    exp_dict["quality_flag"] = 0 # Default flag (e.g., 0 for pending review, 1 for approved)

    # Insert into the new shared_experiences collection
    try:
        result = await shared_experiences_collection.insert_one(exp_dict)
    except Exception as e:
        print(f"Error inserting shared experience: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save experience.")

    # Fetch the created document to return it, including the generated _id
    created = await shared_experiences_collection.find_one({"_id": result.inserted_id})
    if not created:
        # This case is unlikely if insert succeeded, but good practice
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Experience saved but could not be retrieved.")

    # Validate and return the created experience
    return InterviewExperience.model_validate(created)