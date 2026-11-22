from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GenerateSummaryRequest(BaseModel):
    role: str = ""
    target_role: Optional[str] = None
    experience_level: str = "experienced" # fresher, student, experienced, executive
    key_skills: List[str] = Field(default_factory=list)
    existing_summary: Optional[str] = None
    tone: str = "professional" # professional, modern, executive, concise

class GenerateSummaryResponse(BaseModel):
    summaries: List[str] = Field(default_factory=list)
    selected_summary: str = ""
    suggested_headline: str = ""

class ImproveBulletRequest(BaseModel):
    bullet: str
    role: Optional[str] = None
    company: Optional[str] = None
    target_role: Optional[str] = None

class BulletOption(BaseModel):
    text: str
    rationale: str
    metrics_included: bool

class ImproveBulletResponse(BaseModel):
    original: str
    options: List[BulletOption] = Field(default_factory=list)

class ImproveProjectRequest(BaseModel):
    name: str
    description: str
    technologies: List[str] = Field(default_factory=list)
    target_role: Optional[str] = None

class ImproveProjectResponse(BaseModel):
    improved_description: str
    bullet_points: List[str] = Field(default_factory=list)
    suggested_technologies: List[str] = Field(default_factory=list)

class ReviewResumeRequest(BaseModel):
    resume_data: Dict[str, Any]

class ReviewIssue(BaseModel):
    section: str
    type: str # warning, suggestion, error
    message: str
    recommendation: str

class ReviewResumeResponse(BaseModel):
    overall_score: int
    strengths: List[str] = Field(default_factory=list)
    improvements: List[ReviewIssue] = Field(default_factory=list)
    word_count: int
    estimated_read_time_seconds: int
