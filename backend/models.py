# models.py
from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId

class InterviewRound(BaseModel):
    round_number: int
    type: Optional[str] = None
    questions: List[str] = []

class TestCase(BaseModel):
    input: Any
    output: Any
    explanation: Optional[str] = None

class LeetcodeQuestion(BaseModel):
    problem_name: Optional[str] = None
    problem_statement: Optional[str] = None
    function_signature: Optional[str] = None
    test_cases: List[TestCase] = []

class DesignQuestion(BaseModel):
    design_task: Optional[str] = None
    description: Optional[str] = None
    guiding_questions: Optional[List[str]] = None

class InterviewExperience(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    company: Optional[str] = None
    position: Optional[str] = None
    seniority: Optional[str] = None
    location: Optional[str] = None

    interview_details: Optional[List[InterviewRound]] = None
    leetcode_questions: Optional[List[LeetcodeQuestion]] = None
    design_questions: Optional[List[DesignQuestion]] = None
    problem_link: Optional[List[HttpUrl]] = None

    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    quality_flag: Optional[int] = None
    quality_reasoning: Optional[str] = None
    topicId: Optional[int] = None

    # Use createdAt for sorting and metadata
    createdAt: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "extra": "ignore",
    }

    @field_validator("id", mode="before")
    def convert_objectid_to_str(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @field_validator(
        "company", "position", "seniority", "location",
        "difficulty", "offer_status", mode="before"
    )
    def false_or_empty_to_none(cls, v):
        if v is False or v is None or (isinstance(v, str) and not v.strip()):
            return None
        return str(v)

    @field_validator(
        "interview_details", "leetcode_questions", "design_questions", "problem_link",
        mode="before"
    )
    def normalize_list_fields(cls, v):
        return v if isinstance(v, list) else None

class PaginatedInterviewResponse(BaseModel):
    total_count: int
    experiences: List[InterviewExperience]