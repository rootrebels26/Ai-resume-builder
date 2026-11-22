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
