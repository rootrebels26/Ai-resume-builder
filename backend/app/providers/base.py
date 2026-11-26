from abc import ABC, abstractmethod
from typing import Dict, Any
from app.schemas.ai_schema import (
    GenerateSummaryRequest, GenerateSummaryResponse,
    ImproveBulletRequest, ImproveBulletResponse,
    ImproveProjectRequest, ImproveProjectResponse,
    ReviewResumeRequest, ReviewResumeResponse
)
from app.schemas.job_schema import (
    JobAnalyzeRequest, JobAnalyzeResponse,
    MatchResumeRequest, MatchResumeResponse,
    ATSAnalyzeRequest, ATSAnalyzeResponse,
    TailorResumeRequest, TailorResumeResponse
)

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        pass

    @abstractmethod
    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        pass

    @abstractmethod
    async def improve_project(self, request: ImproveProjectRequest) -> ImproveProjectResponse:
        pass

    @abstractmethod
    async def review_resume(self, request: ReviewResumeRequest) -> ReviewResumeResponse:
        pass

    @abstractmethod
    async def analyze_job(self, request: JobAnalyzeRequest) -> JobAnalyzeResponse:
        pass

    @abstractmethod
    async def match_resume(self, request: MatchResumeRequest) -> MatchResumeResponse:
        pass

    @abstractmethod
    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        pass

    @abstractmethod
    async def parse_resume_document(self, text: str, layout_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        pass

    async def parse_section(self, section_type: str, section_text: str, repair_errors: list = None, heading_raw: str = "") -> Dict[str, Any]:
        """Stage 3: Section-scoped extraction. Override in providers."""
        raise NotImplementedError("parse_section not implemented")
