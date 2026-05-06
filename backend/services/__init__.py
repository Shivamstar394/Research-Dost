"""Services module - Business logic for specialized tasks"""

from services.arxiv_service import ArxivService
from services.springer_service import SpringerService
from services.ieee_xplore_service import IEEEXploreService
from services.pubmed_service import PubmedService
from services.rag_service import RAGService
from services.llm_service import LLMService
from services.ssrn_service import SSRNService
__all__ = [
    "ArxivService",
    "PubmedService",
    "RAGService",
    "LLMService"
    "SSRNService"
    "CrossRefService",
    "DOAJService"
]
