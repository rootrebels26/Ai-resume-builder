from app.core.config import settings
from app.providers.base import BaseAIProvider
from app.providers.local_heuristic import LocalHeuristicProvider
from app.providers.gemini import GeminiProvider
from app.providers.groq import GroqProvider
from app.providers.openrouter import OpenRouterProvider

def get_ai_provider() -> BaseAIProvider:
    provider_name = (settings.AI_PROVIDER or "auto").lower().strip()

    if provider_name == "local":
        return LocalHeuristicProvider()
    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()
    elif provider_name == "groq" and settings.GROQ_API_KEY:
        return GroqProvider()
    elif provider_name == "openrouter" and settings.OPENROUTER_API_KEY:
        return OpenRouterProvider()
    elif settings.GEMINI_API_KEY:
        # Auto-select Gemini whenever GEMINI_API_KEY is configured
        return GeminiProvider()
    elif settings.GROQ_API_KEY:
        return GroqProvider()
    elif settings.OPENROUTER_API_KEY:
        return OpenRouterProvider()
    else:
        return LocalHeuristicProvider()

class AIServiceProxy(BaseAIProvider):
    @property
    def provider(self) -> BaseAIProvider:
        return get_ai_provider()

    async def generate_summary(self, request):
        return await self.provider.generate_summary(request)

    async def improve_bullet(self, request):
        return await self.provider.improve_bullet(request)

    async def improve_project(self, request):
        return await self.provider.improve_project(request)

    async def review_resume(self, request):
        return await self.provider.review_resume(request)

    async def analyze_job(self, request):
        return await self.provider.analyze_job(request)

    async def match_resume(self, request):
        return await self.provider.match_resume(request)

    async def tailor_resume(self, request):
        return await self.provider.tailor_resume(request)

    async def parse_resume_document(self, text: str, layout_metadata: dict = None):
        return await self.provider.parse_resume_document(text, layout_metadata)

ai_service = AIServiceProxy()
