from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


ExperienceCategory = Literal[
    "Student",
    "Fresher",
    "Intern",
    "Entry-level",
    "Junior professional",
    "Mid-level professional",
    "Senior professional",
]


class CareerPreferences(BaseModel):
    location: str = ""
    locationType: Literal["none", "india", "city", "remote", "worldwide", "custom"] = "none"
    workMode: Literal["any", "remote", "hybrid", "onsite"] = "any"
    jobType: Literal["any", "internship", "full-time", "part-time", "contract", "freelance"] = "any"
    experienceLevelOverride: Optional[str] = None
    preferredIndustries: List[str] = Field(default_factory=list)
    targetRoles: List[str] = Field(default_factory=list)


class MatchScoreWeights(BaseModel):
    skills: float = 0.40
    education: float = 0.20
    experience: float = 0.20
    projects: float = 0.10
    certifications: float = 0.10


class CareerProfile(BaseModel):
    primary_domain: str = "Unknown"
    secondary_domains: List[str] = Field(default_factory=list)
    recommended_job_titles: List[str] = Field(default_factory=list)
    technical_strengths: List[str] = Field(default_factory=list)
    transferable_skills: List[str] = Field(default_factory=list)
    experience_level: str = "Student"
    education_level: str = "Unknown"
    relevant_industries: List[str] = Field(default_factory=list)
    preferred_work_type: str = "Any"
    potential_career_paths: List[str] = Field(default_factory=list)
    missing_or_underrepresented_skills: List[str] = Field(default_factory=list)
    top_skills: List[str] = Field(default_factory=list)


class JobSearchLink(BaseModel):
    platform: str
    label: str
    url: str
    query: str
    is_verified_live_listing: bool = False


class ScoreFactorBreakdown(BaseModel):
    skills_score: float = 0.0
    education_score: float = 0.0
    experience_score: float = 0.0
    projects_score: float = 0.0
    certifications_score: float = 0.0
    weights_used: Dict[str, float] = Field(default_factory=dict)


class RecommendedRole(BaseModel):
    id: str
    title: str
    category: str
    industry: str = "Technology"
    experience_level: str = "Entry-level"
    estimated_match_score: int = Field(ge=0, le=100)
    match_label: str = "Estimated Resume-to-Role Match"
    score_breakdown: ScoreFactorBreakdown = Field(default_factory=ScoreFactorBreakdown)
    why_matches: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_from_resume_skills: List[str] = Field(default_factory=list)
    recommended_learning_topics: List[str] = Field(default_factory=list)
    alternative_titles: List[str] = Field(default_factory=list)
    search_keywords: List[str] = Field(default_factory=list)
    search_relevance_score: int = Field(default=80, ge=0, le=100)
    evidence: List[str] = Field(default_factory=list)
    search_links: List[JobSearchLink] = Field(default_factory=list)


class SkillsGapSummary(BaseModel):
    existing_skills: List[str] = Field(default_factory=list)
    frequently_requested_skills: List[str] = Field(default_factory=list)
    missing_from_resume: List[str] = Field(default_factory=list)
    learning_priorities: List[str] = Field(default_factory=list)
    distinction_note: str = (
        "Skills listed under 'Missing from Resume' were not detected in your uploaded resume text. "
        "This does not imply you lack the skill—only that it is currently absent from your resume."
    )


class CareerAnalysisRequest(BaseModel):
    resume_data: Dict[str, Any]
    preferences: CareerPreferences = Field(default_factory=CareerPreferences)
    weights: MatchScoreWeights = Field(default_factory=MatchScoreWeights)
    force_refresh: bool = False


class CareerAnalysisResponse(BaseModel):
    career_profile: CareerProfile
    recommendations: List[RecommendedRole] = Field(default_factory=list)
    skills_gap: SkillsGapSummary = Field(default_factory=SkillsGapSummary)
    disclaimer: str = (
        "AI-generated career recommendations and external job-search links based on your resume. "
        "Match scores are transparent estimates and do not represent live vacancies or selection probability."
    )
    is_verified_live_vacancies: bool = False
    provider_used: str = "gemini"
    prompt_version: str = "1.0.0"
    generated_at: str = ""
    resume_fingerprint: str = ""


class RoleDetailsRequest(BaseModel):
    resume_data: Dict[str, Any]
    role: RecommendedRole
    preferences: CareerPreferences = Field(default_factory=CareerPreferences)


class RoleDetailsResponse(BaseModel):
    title: str
    category: str
    industry: str
    experience_level: str
    typical_responsibilities: List[str] = Field(default_factory=list)
    common_qualifications: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    relevant_projects: List[str] = Field(default_factory=list)
    relevant_education: List[str] = Field(default_factory=list)
    missing_resume_keywords: List[str] = Field(default_factory=list)
    areas_to_strengthen: List[str] = Field(default_factory=list)
    suggested_projects: List[str] = Field(default_factory=list)
    skills_to_learn: List[str] = Field(default_factory=list)
    interview_preparation_topics: List[str] = Field(default_factory=list)
    portfolio_improvements: List[str] = Field(default_factory=list)
    resume_improvements: List[str] = Field(default_factory=list)
    certifications_to_consider: List[str] = Field(default_factory=list)
    search_links: List[JobSearchLink] = Field(default_factory=list)
    salary_note: str = "Salary information is not shown because no verified live vacancy source is connected."
