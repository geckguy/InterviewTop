from fastapi import APIRouter, HTTPException, Depends, status
from app.models import InterviewExperience, User
from app.database import shared_experiences_collection
from app.auth.utils import get_current_user
from datetime import datetime

router = APIRouter()


@router.post("/share-experience", response_model=InterviewExperience, status_code=status.HTTP_201_CREATED)
async def create_experience(exp: InterviewExperience, current_user: User = Depends(get_current_user)):
    # Dump as JSON mode so HttpUrl fields become plain strings
    exp_dict = exp.model_dump(mode="json", by_alias=True, exclude_unset=True, exclude={"id"})

    # Ensure any HttpUrl in lists are strings
    if "problem_link" in exp_dict and isinstance(exp_dict["problem_link"], list):
        exp_dict["problem_link"] = [str(url) for url in exp_dict["problem_link"]]
    elif "problem_link" in exp_dict:
         del exp_dict["problem_link"]

    # Add metadata for the submission
    exp_dict["submittedByUserId"] = current_user.id
    exp_dict["createdAt"] = datetime.utcnow()
    exp_dict["quality_flag"] = 0  # Default: pending review

    try:
        result = await shared_experiences_collection.insert_one(exp_dict)
    except Exception as e:
        print(f"Error inserting shared experience: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save experience.")

    created = await shared_experiences_collection.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Experience saved but could not be retrieved.")

    return InterviewExperience.model_validate(created)
