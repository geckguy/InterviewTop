# routes/interviews.py

from fastapi import APIRouter, HTTPException, Query, Depends, status
from models import InterviewExperience, PaginatedInterviewResponse, User # Added VisitedPostSummary import
from database import filtered_posts_collection, users_collection # Import users_collection
from bson import ObjectId
from pydantic import BaseModel, Field, field_validator # Removed EmailStr (not used here)
from typing import List, Optional, Set # Import Set
import re
from auth.utils import get_current_user
# Removed unused datetime import
# from datetime import datetime

router = APIRouter()
class CompanyInfo(BaseModel):
    name: str
    interview_count: int


class VisitedPostSummary(BaseModel):
    id: str = Field(..., alias="_id")
    company: Optional[str] = None
    position: Optional[str] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

# ... get_companies_summary remains the same ...
@router.get("/companies-summary", response_model=List[CompanyInfo])
async def get_companies_summary(
    # user=Depends(get_current_user) # Uncomment if auth needed
):
    pipeline = [
        { "$match": { "company": { "$ne": None, "$type": "string", "$ne": "" } } },
        { "$group": { "_id": {"$toLower": "$company"}, "name": {"$first": "$company"}, "interview_count": {"$sum": 1} } },
        { "$sort": { "interview_count": -1, "name": 1 } },
        { "$project": { "_id": 0, "name": 1, "interview_count": 1 } }
    ]
    results = await filtered_posts_collection.aggregate(pipeline).to_list(length=None)
    return [CompanyInfo(**res) for res in results]


# ... find_interviews remains the same ...
@router.get("/", response_model=PaginatedInterviewResponse)
async def find_interviews(
    search_term: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    position: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    offer_status: Optional[str] = Query(None),
    sort_by: str = Query("date_desc", regex="^(date_asc|date_desc)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    pipeline = []
    query_conditions = {} # Build query conditions for $match

    # Search term matching multiple fields
    if search_term:
        pat = re.compile(search_term, re.IGNORECASE)
        query_conditions["$or"] = [
            {"company": pat}, {"position": pat},
            {"difficulty": pat}, {"offer_status": pat},
            {"quality_reasoning": pat} # Maybe search text content too
        ]

    # Specific field filters (case-insensitive exact match)
    filter_and_conditions = []
    if company:
        filter_and_conditions.append({"company": re.compile(f"^{re.escape(company)}$", re.IGNORECASE)})
    if position:
        filter_and_conditions.append({"position": re.compile(f"^{re.escape(position)}$", re.IGNORECASE)})
    if difficulty:
        filter_and_conditions.append({"difficulty": re.compile(f"^{re.escape(difficulty)}$", re.IGNORECASE)})
    if offer_status:
        filter_and_conditions.append({"offer_status": re.compile(f"^{re.escape(offer_status)}$", re.IGNORECASE)})

    if filter_and_conditions:
        if "$or" in query_conditions: # Combine with search term if present
             query_conditions = {"$and": [query_conditions, {"$and": filter_and_conditions}]}
        else:
             query_conditions["$and"] = filter_and_conditions

    if query_conditions:
         pipeline.append({"$match": query_conditions})

    # Define sorting
    sort_stage = {"$sort": {"createdAt": 1}} if sort_by == "date_asc" else {"$sort": {"createdAt": -1}}

    # Facet for pagination and total count
    facet = pipeline + [{"$facet": {"metadata": [{"$count": "total"}],
                                  "data": [sort_stage, {"$skip": skip}, {"$limit": limit}]}}]

    try:
        res = await filtered_posts_collection.aggregate(facet).to_list(length=1)
    except Exception as e:
        print(f"Error during aggregation: {e}") # Log aggregation errors
        raise HTTPException(status_code=500, detail="Error fetching interviews")

    if not res or not res[0].get("metadata"): # More robust check
        return PaginatedInterviewResponse(total_count=0, experiences=[])

    total = res[0]["metadata"][0].get("total", 0) # Safer access
    docs = res[0].get("data", []) # Safer access

    try:
        experiences = [InterviewExperience.model_validate(d) for d in docs]
    except Exception as e:
        print(f"Error validating interview data: {e}") # Log validation errors
        # Decide how to handle validation errors, maybe return partial results or error
        raise HTTPException(status_code=500, detail="Error processing interview data")

    return PaginatedInterviewResponse(total_count=total, experiences=experiences)


# ... get_recent_experiences remains the same ...
@router.get("/recent-experiences", response_model=List[InterviewExperience])
async def get_recent_experiences(limit: int = Query(5, ge=1, le=50)):
    page = await find_interviews(
        search_term=None, company=None, position=None, difficulty=None,
        offer_status=None, sort_by="date_desc", skip=0, limit=limit
    )
    return page.experiences


# ... get_interview remains the same ...
@router.get("/{id}", response_model=InterviewExperience)
async def get_interview(id: str, current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Interview ID")

    post_oid = ObjectId(id)

    doc = await filtered_posts_collection.find_one({"_id": post_oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    if current_user.id:
        try:
            user_oid = ObjectId(current_user.id)
            await users_collection.update_one(
                {"_id": user_oid},
                {"$addToSet": {"visited_posts": post_oid}}
            )
        except Exception as e:
             # Log error but don't fail the request
             print(f"Error updating visited posts for user {current_user.id}: {e}")

    return InterviewExperience.model_validate(doc)


# --- MODIFIED get_similar ---
@router.get("/{id}/similar", response_model=List[InterviewExperience])
async def get_similar(id: str, limit: int = Query(3, ge=1, le=20), current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target Interview ID")

    target_oid = ObjectId(id)

    # Find the target post's company
    target = await filtered_posts_collection.find_one(
        {"_id": target_oid}, {"company": 1}
    )
    if not target or not target.get("company"):
        return [] # No company found for target, cannot find similar

    target_company = target["company"]

    # --- Get visited posts for the current user ---
    visited_post_ids: Set[ObjectId] = set() # Default to empty set
    if current_user.id: # Check if user ID exists in token payload
        try:
            user_oid = ObjectId(current_user.id) # Validate user ID from token
            user_data = await users_collection.find_one(
                {"_id": user_oid},
                {"visited_posts": 1} # Project only the needed field
            )
            if user_data and "visited_posts" in user_data and user_data["visited_posts"]:
                # Ensure visited_posts contains valid ObjectIds
                visited_post_ids = {oid for oid in user_data["visited_posts"] if isinstance(oid, ObjectId)}
        except Exception as e:
             # Log the error, but don't fail the request, just don't filter visited
             print(f"Warning: Could not retrieve or process visited posts for user {current_user.id}: {e}")
             visited_post_ids = set() # Reset to empty set on error

    # --- Build the query to find similar posts ---
    query = {
        "company": target_company, # Match the company
        "_id": {
            "$ne": target_oid, # Exclude the target post itself
             # Exclude posts the user has already visited, if any
            **({"$nin": list(visited_post_ids)} if visited_post_ids else {})
        }
    }

    # Fetch similar posts, excluding visited ones
    cursor = (
        filtered_posts_collection
        .find(query)
        .sort("createdAt", -1) # Sort by most recent
        .limit(limit) # Limit the number of results
    )
    docs = await cursor.to_list(length=limit)

    # Validate and return the results
    return [InterviewExperience.model_validate(d) for d in docs]
# --- END MODIFIED get_similar ---


# ... VisitedPostSummary Model remains the same ...
# class VisitedPostSummary(BaseModel): ... # Defined in user's provided code


# The get_visited_posts endpoint uses the locally defined VisitedPostSummary
@router.get("/users/me/visited-posts", response_model=List[VisitedPostSummary])
async def get_visited_posts(
    current_user: User = Depends(get_current_user),
):
    if not current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")

    try:
        user_oid = ObjectId(current_user.id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token")

    user_data = await users_collection.find_one(
        {"_id": user_oid},
        {"visited_posts": 1}
    )

    if not user_data or "visited_posts" not in user_data or not user_data["visited_posts"]:
        return []

    visited_post_ids = [oid for oid in user_data["visited_posts"] if isinstance(oid, ObjectId)]

    if not visited_post_ids:
        return []

    visited_posts_cursor = filtered_posts_collection.find(
        {"_id": {"$in": visited_post_ids}},
        {"_id": 1, "company": 1, "position": 1}
    )

    visited_posts_docs = await visited_posts_cursor.to_list(length=None)

    # Validate using the locally defined model
    return [VisitedPostSummary.model_validate(doc) for doc in visited_posts_docs]