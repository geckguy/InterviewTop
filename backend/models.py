from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class InterviewRound(BaseModel):
    round_number: int
    type: str
    questions: List[str]

class LeetcodeQuestion(BaseModel):
    problem_name: str
    problem_statement: str
    function_signature: str
    test_cases: List[str]

class DesignQuestion(BaseModel):
    design_task: str
    description: str
    guiding_questions: List[str]

class InterviewExperience(BaseModel):
    company: str
    position: str
    seniority: str
    location: Optional[str] = None
    interview_details: List[InterviewRound]
    leetcode_questions: List[LeetcodeQuestion]
    design_questions: List[DesignQuestion]
    problem_link: List[HttpUrl]
    quality_flag: int
