from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class JobProvider(ABC):
    """
    Future-ready optional adapter interface for live job vacancy providers
    (e.g., Jooble, Adzuna, or company ATS feeds).
    """

    @abstractmethod
    async def search_jobs(
        self, query: str, location: str = "", filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_provider_status(self) -> Dict[str, Any]:
        pass


class NoKeyExternalSearchProvider(JobProvider):
    """
    Default zero-API-key provider. Never fabricates live vacancies; reports
    status clearly so the UI shows AI recommendations and external search links.
    """

    async def search_jobs(
        self, query: str, location: str = "", filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        return []

    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": str(raw_job.get("title", "")).strip(),
            "company": str(raw_job.get("company", "")).strip(),
            "location": str(raw_job.get("location", "")).strip(),
            "url": str(raw_job.get("url", "")).strip(),
            "is_verified_live_listing": False,
        }

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "provider": "zero_key_external_search",
            "live_vacancies_enabled": False,
            "requires_api_key": False,
            "message": "Using AI role recommendations and personalized external search links (no paid job API configured).",
        }
