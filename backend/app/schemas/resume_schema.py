from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PersonalInfo(BaseModel):
    fullName: str = ""
    preferredName: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    professionalTitle: str = ""
    headline: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""
    gitlab: str = ""
    portfolio: str = ""
    behance: str = ""
    dribbble: str = ""

class Education(BaseModel):
    id: Optional[str] = None
    institution: str = ""
    degree: str = ""
    fieldOfStudy: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    cgpa: str = ""
    description: str = ""

class Experience(BaseModel):
    id: Optional[str] = None
    company: str = ""
    position: str = ""
    employmentType: str = "Full-time"
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False
    responsibilities: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    sourcePage: Optional[int] = None

class Internship(BaseModel):
    id: Optional[str] = None
    organization: str = ""
    role: str = ""
    location: str = ""
    duration: str = ""
    startDate: str = ""
    endDate: str = ""
    responsibilities: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    sourcePage: Optional[int] = None

class Project(BaseModel):
    id: Optional[str] = None
    name: str = ""
    category: str = ""
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    githubUrl: str = ""
    liveUrl: str = ""
    startDate: str = ""
    endDate: str = ""
    highlights: List[str] = Field(default_factory=list)
    sourcePage: Optional[int] = None

class SkillCategory(BaseModel):
    category: str = "Technical" # e.g. Languages, Frameworks, Databases, Tools, Soft Skills
    items: List[str] = Field(default_factory=list)

class Certification(BaseModel):
    id: Optional[str] = None
    name: str = ""
    issuer: str = ""
    credentialId: str = ""
    issueDate: str = ""
    expiryDate: str = ""
    credentialUrl: str = ""

class Achievement(BaseModel):
    id: Optional[str] = None
    title: str = ""
    description: str = ""
    date: str = ""

class Language(BaseModel):
    name: str = ""
    proficiency: str = "Proficient" # Native, Fluent, Proficient, Conversational

class Publication(BaseModel):
    id: Optional[str] = None
    title: str = ""
    publisher: str = ""
    date: str = ""
    url: str = ""
    description: str = ""

class VolunteerExperience(BaseModel):
    id: Optional[str] = None
    organization: str = ""
    role: str = ""
    duration: str = ""
    description: str = ""

class CustomSectionItem(BaseModel):
    title: str = ""
    subtitle: str = ""
    date: str = ""
    description: str = ""

class CustomSection(BaseModel):
    id: Optional[str] = None
    sectionTitle: str = ""
    normalizedCategory: str = "custom"
    items: List[CustomSectionItem] = Field(default_factory=list)
    sourcePage: Optional[int] = None

class Preferences(BaseModel):
    themeColor: str = "#0c87eb"
    fontFamily: str = "Inter"
    fontSize: str = "medium" # small, medium, large
    spacing: str = "normal" # compact, normal, spacious
    dateFormat: str = "MMM YYYY"
    showIcons: bool = True

class ResumeData(BaseModel):
    schemaVersion: str = "1.1.0"
    templateId: str = "ats-01"
    personalInfo: PersonalInfo = Field(default_factory=PersonalInfo)
    professionalSummary: str = ""
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    internships: List[Internship] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    skills: List[SkillCategory] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    achievements: List[Achievement] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)
    volunteerExperience: List[VolunteerExperience] = Field(default_factory=list)
    customSections: List[CustomSection] = Field(default_factory=list)
    preferences: Preferences = Field(default_factory=Preferences)
    sourceDocument: Dict[str, Any] = Field(default_factory=dict)
    extractionReport: Dict[str, Any] = Field(default_factory=dict)
    fieldEvidence: List[Dict[str, Any]] = Field(default_factory=list)
