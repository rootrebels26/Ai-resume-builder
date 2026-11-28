import logging
from typing import List
from app.core.config import settings
from app.providers.base import BaseAIProvider
from app.providers.local_heuristic import LocalHeuristicProvider
from app.providers.gemini import GeminiProvider
from app.providers.groq import GroqProvider
from app.providers.openrouter import OpenRouterProvider

logger = logging.getLogger("ai_service")


def get_provider_chain() -> List[BaseAIProvider]:
    """
    Multi-model failover chain:
    Orders configured cloud providers (starting with AI_PROVIDER) and ends with LocalHeuristicProvider.
    """
    provider_name = (settings.AI_PROVIDER or "auto").lower().strip()
    if provider_name == "local" or getattr(settings, "APP_ENV", "").lower() == "testing":
        return [LocalHeuristicProvider()]

    available = []
    if settings.GROQ_API_KEY:
        available.append(("groq", GroqProvider))
    if settings.GEMINI_API_KEY:
        available.append(("gemini", GeminiProvider))
    if settings.OPENROUTER_API_KEY:
        available.append(("openrouter", OpenRouterProvider))

    if provider_name in ("groq", "gemini", "openrouter"):
        available.sort(key=lambda item: 0 if item[0] == provider_name else 1)

    chain: List[BaseAIProvider] = [cls() for _, cls in available]
    chain.append(LocalHeuristicProvider())
    return chain


def get_ai_provider() -> BaseAIProvider:
    return get_provider_chain()[0]


class AIServiceProxy(BaseAIProvider):
    @property
    def provider(self) -> BaseAIProvider:
        return get_ai_provider()

    async def _call_with_failover(self, method_name: str, *args, **kwargs):
        chain = get_provider_chain()
        last_err = None
        for idx, prov in enumerate(chain):
            try:
                fn = getattr(prov, method_name)
                res = await fn(*args, **kwargs)
                if res is not None:
                    return res
            except Exception as exc:
                last_err = exc
                logger.warning(
                    "AI provider %s.%s failed (%s); failing over to next model (%d/%d).",
                    type(prov).__name__, method_name, exc, idx + 1, len(chain)
                )
        if last_err:
            logger.error("All AI providers failed for %s: %s", method_name, last_err)
        return await LocalHeuristicProvider().__getattribute__(method_name)(*args, **kwargs)

    async def generate_summary(self, request):
        return await self._call_with_failover("generate_summary", request)

    async def improve_bullet(self, request):
        return await self._call_with_failover("improve_bullet", request)

    async def improve_project(self, request):
        return await self._call_with_failover("improve_project", request)

    async def review_resume(self, request):
        return await self._call_with_failover("review_resume", request)

    async def analyze_job(self, request):
        return await self._call_with_failover("analyze_job", request)

    async def match_resume(self, request):
        return await self._call_with_failover("match_resume", request)

    async def tailor_resume(self, request):
        return await self._call_with_failover("tailor_resume", request)

    async def parse_resume_document(self, text: str, layout_metadata: dict = None):
        return await self._call_with_failover("parse_resume_document", text, layout_metadata)

    async def parse_section(self, section_type: str, section_text: str, repair_errors: list = None, heading_raw: str = ""):
        return await self._call_with_failover("parse_section", section_type, section_text, repair_errors=repair_errors, heading_raw=heading_raw)

ai_service = AIServiceProxy()
