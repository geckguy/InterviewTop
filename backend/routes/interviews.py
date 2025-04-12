from fastapi import APIRouter, HTTPException, Query
from models import InterviewExperience, PaginatedInterviewResponse
from database import processed_posts_collection  # adjust as needed
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import re
import traceback

router = APIRouter()

def get_base_pipeline(
    search_term: Optional[str] = None,
    company: Optional[str] = None,
    position: Optional[str] = None,
    difficulty: Optional[str] = None,
    offer_status: Optional[str] = None,
    target_company_for_similar: Optional[str] = None
):
    # If you need text search, add it here:
    match_filter = {}
    pipeline = []

    # If we have pre-normalization filters, apply them. (Currently none)
    if match_filter:
        pipeline.append({"$match": match_filter})

    # 1) Normalize fields from candidate_background
    pipeline.append({
        "$addFields": {
            "company": {"$ifNull": ["$candidate_background.company", "$company"]},
            "position": {"$ifNull": ["$candidate_background.position", "$position"]},
            "location": {"$ifNull": ["$candidate_background.location", "$location"]},
            "seniority": {"$ifNull": ["$candidate_background.seniority", "$seniority"]},
        }
    })

    # Build the post-normalization filters
    filter_conditions = []
    if company:
        filter_conditions.append({"company": re.compile(f"^{re.escape(company)}$", re.IGNORECASE)})
    elif target_company_for_similar:
        filter_conditions.append({"company": re.compile(f"^{re.escape(target_company_for_similar)}$", re.IGNORECASE)})

    if position:
        filter_conditions.append({"position": re.compile(f"^{re.escape(position)}$", re.IGNORECASE)})
    if difficulty:
        filter_conditions.append({"difficulty": re.compile(f"^{re.escape(difficulty)}$", re.IGNORECASE)})
    if offer_status:
        filter_conditions.append({"offer_status": re.compile(f"^{re.escape(offer_status)}$", re.IGNORECASE)})

    if filter_conditions:
        pipeline.append({"$match": {"$and": filter_conditions}})

    # Remove candidate_background
    pipeline.append({"$unset": "candidate_background"})

    # 2) Lookup in 'posts' and flatten updatedAt
    pipeline += [
        {
            "$lookup": {
                "from": "posts",
                "localField": "topicId",
                "foreignField": "topicId",
                "as": "post_details_array"
            }
        },
        {
            "$unwind": {
                "path": "$post_details_array",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$addFields": {
                "updatedAt": "$post_details_array.updatedAt",
                # used for sorting
                "effectiveDate": {
                    "$ifNull": ["$post_details_array.updatedAt", datetime.min]
                }
            }
        },
        # Finally, unset array so we don't have extra fields
        {
            "$unset": ["post_details_array"]
        },
    ]

    return pipeline


@router.get("/", response_model=PaginatedInterviewResponse)
async def find_interviews(
    search_term: Optional[str] = None,
    company: Optional[str] = None,
    position: Optional[str] = None,
    difficulty: Optional[str] = None,
    offer_status: Optional[str] = None,
    sort_by: str = "date_desc",
    skip: int = 0,
    limit: int = 10,
):
    """
    General search + pagination
    """
    base_pipeline = get_base_pipeline(
        search_term=search_term,
        company=company,
        position=position,
        difficulty=difficulty,
        offer_status=offer_status
    )

    # Sort stage
    if sort_by == "date_asc":
        sort_stage = {"$sort": {"effectiveDate": 1}}
    else:  # default to descending
        sort_stage = {"$sort": {"effectiveDate": -1}}

    facet_pipeline = base_pipeline + [
        {
            "$facet": {
                "metadata": [{"$count": "total"}],
                "data": [
                    sort_stage,
                    {"$skip": skip},
                    {"$limit": limit}
                ]
            }
        }
    ]

    results = await processed_posts_collection.aggregate(facet_pipeline).to_list(length=1)

    if not results or not results[0]["metadata"]:
        total_count = 0
        experiences_data = []
    else:
        total_count = results[0]["metadata"][0]["total"]
        experiences_data = results[0]["data"]

    experiences = []
    for doc in experiences_data:
        # Each doc should only contain the fields that InterviewExperience expects
        try:
            experiences.append(InterviewExperience(**doc))
        except Exception as e:
            # If there's a validation error, log it
            print("Validation error in find_interviews:")
            traceback.print_exc()
            # Optionally skip the doc or raise
            raise HTTPException(
                status_code=500,
                detail=f"Pydantic error: {str(e)}"
            )

    return PaginatedInterviewResponse(total_count=total_count, experiences=experiences)


@router.get("/recent-experiences", response_model=List[InterviewExperience])
async def get_recent_experiences(limit: int = 5):
    """
    Returns the most recent experiences.
    """
    paginated_response = await find_interviews(
        sort_by="date_desc",
        skip=0,
        limit=limit
    )
    return paginated_response.experiences


@router.get("/{id}", response_model=InterviewExperience)
async def get_interview(id: str):
    """
    Gets a single doc by _id
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    pipeline = [
        {"$match": {"_id": ObjectId(id)}},
        {"$limit": 1},
        # Normalize fields
        {
            "$addFields": {
                "company": {"$ifNull": ["$candidate_background.company", "$company"]},
                "position": {"$ifNull": ["$candidate_background.position", "$position"]},
                "location": {"$ifNull": ["$candidate_background.location", "$location"]},
                "seniority": {"$ifNull": ["$candidate_background.seniority", "$seniority"]},
            }
        },
        {"$unset": "candidate_background"},
        # Lookup
        {
            "$lookup": {
                "from": "posts",
                "localField": "topicId",
                "foreignField": "topicId",
                "as": "post_details_array"
            }
        },
        {
            "$unwind": {
                "path": "$post_details_array",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$addFields": {
                "updatedAt": "$post_details_array.updatedAt"
            }
        },
        {
            "$unset": ["post_details_array"]
        }
    ]

    try:
        result_docs = await processed_posts_collection.aggregate(pipeline).to_list(length=1)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Database error")

    if not result_docs:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        return InterviewExperience.model_validate(result_docs[0])
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pydantic error: {str(e)}")


@router.get("/{id}/similar", response_model=List[InterviewExperience])
async def get_similar_interviews(id: str, limit: int = 3):
    """
    Similar docs based on 'company'
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    # get the company's name
    target_pipeline = [
        {"$match": {"_id": ObjectId(id)}},
        {"$limit": 1},
        {
            "$addFields": {
                "company": {"$ifNull": ["$candidate_background.company", "$company"]},
            }
        },
        {"$project": {"company": 1}}
    ]
    target_doc = await processed_posts_collection.aggregate(target_pipeline).to_list(length=1)
    if not target_doc:
        raise HTTPException(status_code=404, detail="No such doc")

    target_company = target_doc[0].get("company", "")
    if not target_company:
        # If no company, can't find similar
        return []

    # Exclude the same doc
    exclusion_stage = {"$match": {"_id": {"$ne": ObjectId(id)}}}

    # re-use pipeline
    base_pipeline = get_base_pipeline(target_company_for_similar=target_company)
    full_pipeline = [exclusion_stage] + base_pipeline + [
        {"$sort": {"effectiveDate": -1}},
        {"$limit": limit}
    ]

    docs = await processed_posts_collection.aggregate(full_pipeline).to_list(length=limit)

    # parse
    experiences = []
    for doc in docs:
        try:
            experiences.append(InterviewExperience.model_validate(doc))
        except Exception as e:
            traceback.print_exc()
            # skip or raise?
            raise HTTPException(status_code=500, detail=f"Pydantic error: {str(e)}")

    return experiences
