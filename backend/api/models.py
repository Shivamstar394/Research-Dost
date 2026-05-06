from pydantic import BaseModel, Field
from typing import List, Optional
from typing import List, Optional, Dict  

class ResearchQueryRequest(BaseModel):
    """Request model for research queries"""
    query: str = Field(..., min_length=1, max_length=500)
    sources: List[str] = Field(default=["arxiv", "pubmed", "crossref", "doaj", "ssrn", "springer", "ieee_xplore",], description="List of sources to search")
    template_id: Optional[str] = Field(
        default=None,
        description="Preferred template for structuring notes (ieee, springer, acm, elsevier, imrad)"
    )
    class Config:
        example = {
            "query": "reinforcement learning in robotics",
            "sources": ["arxiv", "pubmed", "springer", "ieee_xplore",],
            "template_id": "ieee"
        }

class ResearchResponse(BaseModel):
    """Response model for research results"""
    query: str
    status: str
    papers_found: Optional[int] = None
    answer: Optional[str] = None
    research_notes: Optional[str] = None
    paper_summaries: Optional[List[dict]] = None
    sources_used: Optional[List[str]] = None
    message: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str

class DraftSectionsRequest(BaseModel):
    """
    Request for auto-generating paper sections based on a template.
    """
    query: str = Field(..., min_length=1, max_length=500)
    template_id: str = Field(..., description="Template ID: ieee, springer, acm, elsevier, imrad")
    sections: List[str] = Field(..., description="List of section titles to generate")
    top_papers: int = Field(default=8, ge=1, le=30, description="How many top papers to use as context")


class DraftSectionsResponse(BaseModel):
    """
    Generated sections + concatenated drafts.
    """
    sections: Dict[str, str]
    markdown: str
    latex_ieee: Optional[str] = None

class VerifyReferencesRequest(BaseModel):
    references: List[str]
    sources: List[str] = ["ieee", "springer", "acm", "scopus"]

class VerifyMatch(BaseModel):
    source: str
    sourceName: str
    confidence: int
    url: Optional[str] = None

class VerifyReferenceResult(BaseModel):
    status: str                 # verified | partial | not_found
    confidence: int
    doi: Optional[str] = None
    title: Optional[str] = None
    matches: List[VerifyMatch] = []
    raw: str

class VerifyReferencesResponse(BaseModel):
    results: List[VerifyReferenceResult]