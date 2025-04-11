from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional

class InterviewRound(BaseModel):
    round_number: int
    type: str
    questions: List[str]

class TestCase(BaseModel):
    input: str
    output: str
    explanation: str

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
    leetcode_questions: List[LeetcodeQuestion]
    design_questions: List[DesignQuestion] = []
    problem_link: List[HttpUrl] = []
    
    # Additional fields that might be missing in the DB are marked as optional.
    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    quality_flag: Optional[int] = None
    quality_reasoning: Optional[str] = None
    topicId: Optional[int] = None
    id: Optional[str] = None

    # Pydantic V2 style field validator to convert boolean False to an empty string.
    @field_validator("position", "seniority", "location", mode="before")
    def convert_false_to_empty(cls, v):
        if v is False:
            return ""
        return v
