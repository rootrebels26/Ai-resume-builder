from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.career_schema import JobSearchLink


class NormalizedJob(BaseModel):
    id: str
    title: str
    company: str
    location: str = "Not specified"
    work_mode: str = "Not specified"  # Remote | Hybrid | On-site | Not specified
    employment_type: str = "Not specified"  # Internship | Full-time | Part-time | Contract | Not specified
    experience_level: str = "Not specified"
    salary: str = ""  # Only populated if provided by source
    source: str
    source_url: str = ""
    apply_url: str
    posted_at: str = ""
    description_text: str = ""
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    is_fresher_friendly: bool = False
    is_verified_live_listing: bool = True
    fetched_at: str = ""


class JobSourceStatus(BaseModel):
    source_id: str
    name: str
    status: str  # ok | unavailable | timeout
    count: int = 0
    fetched_at: str = ""
    error: Optional[str] = None


class HybridMatchWeights(BaseModel):
    required_skills: float = 0.35
    experience: float = 0.20
    education: float = 0.15
    projects: float = 0.15
    title_similarity: float = 0.10
    certifications: float = 0.05


class JobMatchBreakdown(BaseModel):
    required_skill_match: float = 0.0
    relevant_experience: float = 0.0
    education_compatibility: float = 0.0
    project_relevance: float = 0.0
    title_similarity: float = 0.0
    certifications: float = 0.0
    tfidf_cosine_similarity: float = 0.0
    weights_used: Dict[str, float] = Field(default_factory=dict)


class MatchedJob(BaseModel):
    job: NormalizedJob
    match_score: int = Field(ge=0, le=100)
    match_label: str = "Estimated Resume-Job Compatibility Score"
    breakdown: JobMatchBreakdown = Field(default_factory=JobMatchBreakdown)
    matching_skills: List[str] = Field(default_factory=list)
    missing_or_unverified_skills: List[str] = Field(default_factory=list)
    reasons_for_match: List[str] = Field(default_factory=list)
    improvement_recommendations: List[str] = Field(default_factory=list)
    ai_explanation: str = ""


class EditableCareerProfile(BaseModel):
    career_summary: str = ""
    experience_level: str = "Fresher"
    target_roles: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    preferred_work_modes: List[str] = Field(default_factory=lambda: ["Remote", "Hybrid", "On-site"])
    employment_types: List[str] = Field(default_factory=lambda: ["Internship", "Full-time"])
    preferred_industry: str = ""
    education_summary: str = ""
    certifications: List[str] = Field(default_factory=list)
    projects_summary: List[str] = Field(default_factory=list)


class CareerProfileGenerateRequest(BaseModel):
    resume_data: Dict[str, Any]


class JobSearchRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(default_factory=dict)
    career_profile: Optional[EditableCareerProfile] = None
    query: str = ""
    location: str = ""
    work_mode: str = "any"  # any | remote | hybrid | onsite
    employment_type: str = "any"  # any | internship | full-time | part-time | contract
    experience_level: str = "any"
    fresher_only: bool = False
    min_match: int = 0
    company: str = ""
    source: str = "all"
    weights: HybridMatchWeights = Field(default_factory=HybridMatchWeights)
    include_ai_explanation: bool = False
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=50)


class JobSearchResponse(BaseModel):
    jobs: List[MatchedJob] = Field(default_factory=list)
    total_count: int = 0
    page: int = 1
    limit: int = 20
    sources_status: List[JobSourceStatus] = Field(default_factory=list)
    fallback_search_links: List[JobSearchLink] = Field(default_factory=list)
    cached: bool = False
    generated_at: str = ""


class SingleJobMatchRequest(BaseModel):
    resume_data: Dict[str, Any]
    job: NormalizedJob
    weights: HybridMatchWeights = Field(default_factory=HybridMatchWeights)
    include_ai_explanation: bool = True
