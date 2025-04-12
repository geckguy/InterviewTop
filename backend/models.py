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

    interview_details: List[InterviewRound] = []
    leetcode_questions: List[LeetcodeQuestion] = []
    design_questions: List[DesignQuestion] = []
    problem_link: List[HttpUrl] = []

    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    quality_flag: Optional[int] = None
    quality_reasoning: Optional[str] = None
    topicId: Optional[int] = None

    # Flattened from "posts" collection
    updatedAt: Optional[datetime] = None

    # Model Config (Pydantic v2 style)
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "extra": "ignore",  # ignore any fields not defined here
    }

    @field_validator("id", mode="before")
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    @field_validator("position", "seniority", "location", "company", "difficulty", "offer_status", mode="before")
    def convert_false_or_none_to_empty(cls, v):
        if v is False or v is None:
            return ""
        if not isinstance(v, str):
            return str(v)
        return v

    @field_validator("interview_details", "leetcode_questions", "design_questions", "problem_link", mode="before")
    def ensure_list(cls, v):
        return v if isinstance(v, list) else []


class PaginatedInterviewResponse(BaseModel):
    total_count: int
    experiences: List[InterviewExperience]
