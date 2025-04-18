from fastapi import APIRouter, HTTPException
from models import InterviewExperience
from database import filtered_posts_collection, posts_collection

router = APIRouter()

@router.post("/share-experience", response_model=InterviewExperience)
async def create_experience(exp: InterviewExperience):
    # Dump as JSON mode so HttpUrl fields become plain strings
    exp_dict = exp.model_dump(mode="json", by_alias=True, exclude_unset=True)

    # Ensure any HttpUrl in lists are strings (double safe)
    if "problem_link" in exp_dict:
        exp_dict["problem_link"] = [str(url) for url in exp_dict["problem_link"]]

    # Copy createdAt from original posts
    post = await posts_collection.find_one(
        {"topicId": exp_dict.get("topicId")},
        {"createdAt": 1, "_id": 0}
    )
    if post and post.get("createdAt"):
        exp_dict["createdAt"] = post["createdAt"]

    # Insert into filtered_posts
    result = await filtered_posts_collection.insert_one(exp_dict)
    created = await filtered_posts_collection.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(500, "Insert failed")
    return InterviewExperience.model_validate(created)
