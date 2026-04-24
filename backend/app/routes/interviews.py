from fastapi import APIRouter, HTTPException, Query, Depends, status
from app.models import (
    InterviewExperience,
    PaginatedInterviewResponse,
    User,
    CompanyInfo,
    VisitedPostSummary,
    SaveStatusResponse,
)
from app.database import filtered_posts_collection, users_collection
from bson import ObjectId
from typing import List, Optional, Set
import re
from app.auth.utils import get_current_user
from datetime import datetime

router = APIRouter()


# --- Helper Functions ---

def get_user_oid(user: User) -> ObjectId:
    """Safely converts user ID from token to ObjectId."""
    if not user.id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User ID missing in authenticated user data.")
    try:
        return ObjectId(user.id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token.")


def get_post_oid(post_id: str) -> ObjectId:
    """Safely validates and converts post ID string to ObjectId."""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Post ID format.")
    return ObjectId(post_id)


async def _get_post_summaries(user_oid: ObjectId, field_name: str) -> List[VisitedPostSummary]:
    """Helper to fetch post summaries based on 'visited_posts' or 'saved_posts' field."""
    user_data = await users_collection.find_one(
        {"_id": user_oid},
        {field_name: 1}
    )

    if not user_data or field_name not in user_data or not user_data[field_name]:
        print(f"No {field_name} found for user {user_oid}")
        return []

    print(f"Raw {field_name} data: {user_data[field_name]}")

    # Handle different formats of ObjectId storage
    post_ids = []
    for item in user_data[field_name]:
        if isinstance(item, ObjectId):
            post_ids.append(item)
        elif isinstance(item, dict) and "$oid" in item:
            try:
                post_ids.append(ObjectId(item["$oid"]))
            except Exception as e:
                print(f"Error converting dict with $oid: {e}, value: {item}")
        elif isinstance(item, str):
            try:
                post_ids.append(ObjectId(item))
            except Exception as e:
                print(f"Error converting string to ObjectId: {e}, value: {item}")
        else:
            print(f"Unknown format in {field_name}: {type(item)}, value: {item}")

    if not post_ids:
        print(f"No valid ObjectIds found in {field_name}")
        return []

    print(f"Converted {len(post_ids)} ObjectIds for {field_name}")

    posts_cursor = filtered_posts_collection.find(
        {"_id": {"$in": post_ids}},
        {"_id": 1, "company": 1, "position": 1, "createdAt": 1}
    ).sort("createdAt", -1)

    posts_docs = await posts_cursor.to_list(length=None)
    print(f"Found {len(posts_docs)} documents in filtered_posts_collection for {field_name}")

    try:
        summaries = [VisitedPostSummary.model_validate(doc) for doc in posts_docs]
        return summaries
    except Exception as e:
        print(f"Error validating post summaries for {field_name}: {e}")
        for doc in posts_docs:
            try:
                VisitedPostSummary.model_validate(doc)
            except Exception as e:
                print(f"Error validating document: {doc}, error: {e}")
        return []


# --- Endpoints ---

@router.get("/companies-summary", response_model=List[CompanyInfo])
async def get_companies_summary():
    pipeline = [
        { "$match": { "company": { "$ne": None, "$type": "string", "$ne": "" } } },
        { "$group": { "_id": {"$toLower": "$company"}, "name": {"$first": "$company"}, "interview_count": {"$sum": 1} } },
        { "$sort": { "interview_count": -1, "name": 1 } },
        { "$project": { "_id": 0, "name": 1, "interview_count": 1 } }
    ]
    results = await filtered_posts_collection.aggregate(pipeline).to_list(length=None)
    return [CompanyInfo(**res) for res in results]


@router.get("", response_model=PaginatedInterviewResponse)
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
    query_conditions = {}

    if search_term:
        pat = re.compile(search_term, re.IGNORECASE)
        query_conditions["$or"] = [
            {"company": pat}, {"position": pat}, {"difficulty": pat},
            {"offer_status": pat}, {"quality_reasoning": pat}
        ]

    filter_and_conditions = []

    # Handle multiple company filter (comma-separated)
    if company:
        company_list = [c.strip() for c in company.split(',') if c.strip()]
        if len(company_list) == 1:
            filter_and_conditions.append({"company": re.compile(f"^{re.escape(company_list[0])}$", re.IGNORECASE)})
        elif len(company_list) > 1:
            company_patterns = [re.compile(f"^{re.escape(c)}$", re.IGNORECASE) for c in company_list]
            filter_and_conditions.append({"company": {"$in": company_patterns}})

    if position: filter_and_conditions.append({"position": re.compile(f"^{re.escape(position)}$", re.IGNORECASE)})
    if difficulty: filter_and_conditions.append({"difficulty": re.compile(f"^{re.escape(difficulty)}$", re.IGNORECASE)})
    if offer_status: filter_and_conditions.append({"offer_status": re.compile(f"^{re.escape(offer_status)}$", re.IGNORECASE)})

    if filter_and_conditions:
        if "$or" in query_conditions:
             query_conditions = {"$and": [query_conditions, {"$and": filter_and_conditions}]}
        else:
             query_conditions["$and"] = filter_and_conditions

    if query_conditions:
         pipeline.append({"$match": query_conditions})

    primary_sort_field = "createdAt"
    primary_sort_order = 1 if sort_by == "date_asc" else -1

    sort_stage = {
        "$sort": {
            "is_low_quality": 1,
            primary_sort_field: primary_sort_order
        }
    }

    facet = pipeline + [{"$facet": {"metadata": [{"$count": "total"}],
                                  "data": [sort_stage, {"$skip": skip}, {"$limit": limit}]}}]

    try:
        res = await filtered_posts_collection.aggregate(facet).to_list(length=1)
    except Exception as e:
        print(f"Error during aggregation: {e}")
        raise HTTPException(status_code=500, detail="Error fetching interviews")

    if not res or not res[0].get("metadata") or not res[0].get("data"):
        return PaginatedInterviewResponse(total_count=0, experiences=[])

    total = res[0]["metadata"][0].get("total", 0) if res[0].get("metadata") else 0
    docs = res[0].get("data", [])

    try:
        experiences = [InterviewExperience.model_validate(d) for d in docs]
    except Exception as e:
        print(f"Error validating interview data: {e}")
        raise HTTPException(status_code=500, detail="Error processing interview data")

    return PaginatedInterviewResponse(total_count=total, experiences=experiences)


@router.get("/recent-experiences", response_model=List[InterviewExperience])
async def get_recent_experiences(limit: int = Query(5, ge=1, le=50)):
    page = await find_interviews(
        search_term=None, company=None, position=None, difficulty=None,
        offer_status=None, sort_by="date_desc", skip=0, limit=limit
    )
    return page.experiences


@router.get("/{id}", response_model=InterviewExperience)
async def get_interview(id: str, current_user: User = Depends(get_current_user)):
    post_oid = get_post_oid(id)
    user_oid = get_user_oid(current_user)

    doc = await filtered_posts_collection.find_one({"_id": post_oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    # Add post to visited list (error tolerant)
    try:
        await users_collection.update_one(
            {"_id": user_oid},
            {"$addToSet": {"visited_posts": post_oid}, "$set": {"updated_at": datetime.utcnow()}}
        )
        print(f"Added post {post_oid} to visited_posts for user {user_oid}")
    except Exception as e:
         print(f"Warning: Error updating visited posts for user {user_oid}: {e}")

    return InterviewExperience.model_validate(doc)


@router.get("/{id}/similar", response_model=List[InterviewExperience])
async def get_similar(id: str, limit: int = Query(3, ge=1, le=20), current_user: User = Depends(get_current_user)):
    target_oid = get_post_oid(id)
    user_oid = get_user_oid(current_user)

    target = await filtered_posts_collection.find_one(
        {"_id": target_oid}, {"company": 1}
    )
    if not target or not target.get("company"):
        return []

    target_company = target["company"]

    visited_post_ids: Set[ObjectId] = set()
    try:
        user_data = await users_collection.find_one({"_id": user_oid}, {"visited_posts": 1})
        if user_data and user_data.get("visited_posts"):
            visited_post_ids = {oid for oid in user_data["visited_posts"] if isinstance(oid, ObjectId)}
    except Exception as e:
         print(f"Warning: Could not retrieve visited posts for user {user_oid} in similar: {e}")

    query = {
        "company": target_company,
        "_id": {
            "$ne": target_oid,
            **({"$nin": list(visited_post_ids)} if visited_post_ids else {})
        }
    }

    cursor = filtered_posts_collection.find(query).sort(
        [("is_low_quality", 1), ("createdAt", -1)]
    ).limit(limit)
    docs = await cursor.to_list(length=limit)

    return [InterviewExperience.model_validate(d) for d in docs]


# --- Save/Unsave Endpoints ---

@router.get("/{id}/savestatus", response_model=SaveStatusResponse)
async def get_save_status(id: str, current_user: User = Depends(get_current_user)):
    """Checks if the current user has saved the specified post."""
    post_oid = get_post_oid(id)
    user_oid = get_user_oid(current_user)

    user_data = await users_collection.find_one(
        {"_id": user_oid, "saved_posts": post_oid},
        {"_id": 1}
    )
    return SaveStatusResponse(is_saved=bool(user_data))


@router.post("/{id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def save_interview(id: str, current_user: User = Depends(get_current_user)):
    """Adds the interview post ID to the current user's saved_posts list."""
    post_oid = get_post_oid(id)
    user_oid = get_user_oid(current_user)

    post_exists = await filtered_posts_collection.count_documents({"_id": post_oid})
    if post_exists == 0:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview post to save not found.")

    try:
        result = await users_collection.update_one(
            {"_id": user_oid},
            {
                "$addToSet": {"saved_posts": post_oid},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        if result.matched_count == 0:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found to save post for.")
    except Exception as e:
         print(f"Error saving post {post_oid} for user {user_oid}: {e}")
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save post.")


@router.delete("/{id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_interview(id: str, current_user: User = Depends(get_current_user)):
    """Removes the interview post ID from the current user's saved_posts list."""
    post_oid = get_post_oid(id)
    user_oid = get_user_oid(current_user)

    try:
        result = await users_collection.update_one(
            {"_id": user_oid},
            {
                "$pull": {"saved_posts": post_oid},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found to unsave post for.")
    except Exception as e:
         print(f"Error unsaving post {post_oid} for user {user_oid}: {e}")
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not unsave post.")


# --- Visited/Saved Posts Endpoints ---

@router.get("/users/me/visited-posts", response_model=List[VisitedPostSummary])
async def get_visited_posts(current_user: User = Depends(get_current_user)):
    """Gets summaries of posts recently visited by the current user."""
    user_oid = get_user_oid(current_user)
    return await _get_post_summaries(user_oid, "visited_posts")


@router.get("/users/me/saved-posts", response_model=List[VisitedPostSummary])
async def get_saved_posts(current_user: User = Depends(get_current_user)):
    """Gets summaries of posts saved by the current user."""
    user_oid = get_user_oid(current_user)
    return await _get_post_summaries(user_oid, "saved_posts")
