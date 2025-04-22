from fastapi import APIRouter, HTTPException, Query, Depends
from models import InterviewExperience, PaginatedInterviewResponse
from database import filtered_posts_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
import re
from auth.utils import get_current_user

router = APIRouter()
class CompanyInfo(BaseModel):
    name: str
    interview_count: int

# Define the new route
@router.get("/companies-summary", response_model=List[CompanyInfo])
async def get_companies_summary(
    # user=Depends(get_current_user) # Uncomment if auth needed
):
    pipeline = [
        # 1. Filter for documents where 'company' exists AND is a string type
        {
            "$match": {
                "company": {
                    "$ne": None,        # Ensure it's not null
                    "$type": "string",  # Ensure it's a string type
                    "$ne": ""           # Optionally ensure it's not an empty string
                }
            }
        },
        # 2. Group by company name (case-insensitive) and count
        {
            "$group": {
                "_id": {"$toLower": "$company"}, # Now safe to use $toLower
                "name": {"$first": "$company"},
                "interview_count": {"$sum": 1}
            }
        },
        # 3. Sort by count descending, then by name ascending
        {
            "$sort": {
                "interview_count": -1,
                "name": 1
            }
        },
        # 4. Project to match the CompanyInfo model
        {
            "$project": {
                "_id": 0,
                "name": 1,
                "interview_count": 1
            }
        }
    ]
    results = await filtered_posts_collection.aggregate(pipeline).to_list(length=None)
    return [CompanyInfo(**res) for res in results]

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
    if search_term:
        pat = re.compile(search_term, re.IGNORECASE)
        pipeline.append({"$match": {"$or": [
            {"company": pat}, {"position": pat},
            {"difficulty": pat}, {"offer_status": pat}
        ]}})
    filters = []
    if company:
        filters.append({"company": re.compile(f"^{re.escape(company)}$", re.IGNORECASE)})
    if position:
        filters.append({"position": re.compile(f"^{re.escape(position)}$", re.IGNORECASE)})
    if difficulty:
        filters.append({"difficulty": re.compile(f"^{re.escape(difficulty)}$", re.IGNORECASE)})
    if offer_status:
        filters.append({"offer_status": re.compile(f"^{re.escape(offer_status)}$", re.IGNORECASE)})
    if filters:
        pipeline.append({"$match": {"$and": filters}})

    sort_stage = {"$sort": {"createdAt": 1}} if sort_by == "date_asc" else {"$sort": {"createdAt": -1}}
    facet = pipeline + [{"$facet": {"metadata": [{"$count": "total"}],
                                  "data": [sort_stage, {"$skip": skip}, {"$limit": limit}]}}]
    res = await filtered_posts_collection.aggregate(facet).to_list(length=1)
    if not res or not res[0]["metadata"]:
        return PaginatedInterviewResponse(total_count=0, experiences=[])
    total = res[0]["metadata"][0]["total"]
    docs  = res[0]["data"]
    experiences = [InterviewExperience.model_validate(d) for d in docs]
    return PaginatedInterviewResponse(total_count=total, experiences=experiences)

@router.get("/recent-experiences", response_model=List[InterviewExperience])
async def get_recent_experiences(limit: int = Query(5, ge=1, le=50)):
    # call find_interviews with explicit None to bypass Query defaults
    page = await find_interviews(
        search_term=None,
        company=None,
        position=None,
        difficulty=None,
        offer_status=None,
        sort_by="date_desc",
        skip=0,
        limit=limit
    )
    return page.experiences

@router.get("/{id}", response_model=InterviewExperience)
async def get_interview(id: str, user=Depends(get_current_user) ):
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "Invalid ID")
    doc = await filtered_posts_collection.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Not found")
    return InterviewExperience.model_validate(doc)

@router.get("/{id}/similar", response_model=List[InterviewExperience])
async def get_similar(id: str, limit: int = Query(3, ge=1, le=20), user=Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "Invalid ID")
    target = await filtered_posts_collection.find_one(
        {"_id": ObjectId(id)}, {"company": 1}
    )
    if not target or not target.get("company"):
        return []
    cursor = (
        filtered_posts_collection
        .find({"company": target["company"], "_id": {"$ne": ObjectId(id)}})
        .sort("createdAt", -1)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)
    return [InterviewExperience.model_validate(d) for d in docs]