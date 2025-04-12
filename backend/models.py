from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional, Any, Union

class InterviewRound(BaseModel):
    round_number: int
    type: str
    questions: List[str]

class TestCase(BaseModel):
    input: Any
    output: Any
    explanation: Optional[str] = None

class LeetcodeQuestion(BaseModel):
    problem_name: str
    problem_statement: str
    function_signature: str
    test_cases: List[TestCase]

class DesignQuestion(BaseModel):
    design_task: Optional[str] = None
    description: Optional[str] = None
    guiding_questions: Optional[List[str]] = None

class InterviewExperience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    seniority: Optional[str] = None
    location: Optional[str] = None
    interview_details: List[InterviewRound]
    leetcode_questions: Optional[List[LeetcodeQuestion]] = [] # Make optional if it might be missing
    design_questions: Optional[List[DesignQuestion]] = []
    problem_link: Optional[List[HttpUrl]] = []
    
    # Additional fields that might be missing in the DB are marked as optional.
    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    quality_flag: Optional[int] = None
    quality_reasoning: Optional[str] = None
    topicId: Optional[int] = None
    id: Optional[str] = None

    # Add validators for other potentially problematic fields if necessary
    # Example: Ensure lists are always lists even if null/missing in DB
    @field_validator("interview_details", "leetcode_questions", "design_questions", "problem_link", mode="before")
    def ensure_list(cls, v):
        return v if isinstance(v, list) else []

    @field_validator("position", "seniority", "location", "company", "difficulty", "offer_status", mode="before")
    def convert_false_or_none_to_empty(cls, v):
        if v is False or v is None:
            return ""
        if not isinstance(v, str): # Ensure it's a string if not False/None
            return str(v)
        return v