from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class JobAnalyzeRequest(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: str

class JobAnalyzeResponse(BaseModel):
    job_title: str
    company: str
    technical_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)
    experience_level: str
    responsibilities: List[str] = Field(default_factory=list)
    important_keywords: List[str] = Field(default_factory=list)

class MatchResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str
    job_title: Optional[str] = None

class MatchResumeResponse(BaseModel):
    match_percentage: int
    matched_skills: List[str] = Field(default_factory=list)
    missing_critical_skills: List[str] = Field(default_factory=list)
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class ATSAnalyzeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: Optional[str] = None

class ATSSectionFeedback(BaseModel):
    status: str # good, warning, danger
    score: int # 0-100
    message: str
    details: List[str] = Field(default_factory=list)

class ATSAnalyzeResponse(BaseModel):
    compatibility_score: int
    readability_score: int
    keyword_score: int
    formatting_score: int
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    section_feedback: Dict[str, ATSSectionFeedback] = Field(default_factory=dict)
    critical_issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    is_ats_friendly: bool
    detailed_checks: List[Dict[str, Any]] = Field(default_factory=list)

class TailorResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str
    job_title: Optional[str] = None

class TailorSuggestion(BaseModel):
    section: str # summary, experience, skills, projects
    target_id: Optional[str] = None
    original_text: str
    tailored_text: str
    reason: str

class TailorResumeResponse(BaseModel):
    tailored_summary: str
    suggestions: List[TailorSuggestion] = Field(default_factory=list)
    recommended_skills_to_add: List[str] = Field(default_factory=list)
    tailored_resume_data: Dict[str, Any]
