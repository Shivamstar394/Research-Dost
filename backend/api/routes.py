import re
import urllib.parse
import httpx
from typing import Optional
from api.models import VerifyReferencesRequest, VerifyReferencesResponse



from fastapi import APIRouter, HTTPException
from api.models import (
    ResearchQueryRequest,
    ResearchResponse,
    HealthResponse,
    DraftSectionsRequest,
    DraftSectionsResponse,
)
from agents.research_agent import ResearchAgent
from utils.logger import get_logger
from config import get_settings
from services.prompt_generator import PromptGenerator
from services.template_service import get_template
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from jose import jwt
from config import get_settings
from datetime import datetime
from db import db
settings = get_settings()
query_history_col = db["query_history"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM]
    )
    return payload.get("sub")
router = APIRouter()
logger = get_logger(__name__)
settings = get_settings()

# Initialize agent
agent = ResearchAgent()
prompt_generator = PromptGenerator()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
    }


@router.post("/research", response_model=ResearchResponse)
async def research(
    request: ResearchQueryRequest,
    user: str = Depends(get_current_user)
) -> ResearchResponse:
    """
    Main research endpoint.
    """
    try:
        logger.info(f"Received research request: {request.query}")

        if len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        valid_sources = ["arxiv", "pubmed", "crossref", "doaj", "ssrn", "springer", "ieee_xplore", "semantic_scholar"]
        for source in request.sources:
            if source not in valid_sources:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid source: {source}. Valid sources: {valid_sources}",
                )
                # ✅ Save user query to MongoDB (history)
        doc = {
            "email": user,
            "query": request.query,
            "sources": request.sources,
            "template_id": request.template_id,
            "created_at": datetime.utcnow(),
            "type": "research"
        }
        insert_result = query_history_col.insert_one(doc)
        result = agent.research(
            query=request.query,
            sources=request.sources,
            template_id=request.template_id,
        )
                # ✅ Update saved query with basic outcome metrics
        try:
            query_history_col.update_one(
                {"_id": insert_result.inserted_id},
                {"$set": {
                    "papers_found": result.get("papers_found"),
                    "sources_used": result.get("sources_used"),
                }}
            )
        except Exception as _:
            pass
        return ResearchResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing research request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}",
        )


@router.post("/draft_sections", response_model=DraftSectionsResponse)
async def draft_sections(request: DraftSectionsRequest) -> DraftSectionsResponse:
    """
    Generate draft paper sections (Abstract, Introduction, etc.) using selected template.
    """
    try:
        logger.info(f"Draft sections request: {request.query} | template={request.template_id}")
        result = agent.draft_sections(request)
        return DraftSectionsResponse(**result)
    except Exception as e:
        logger.error(f"Error generating draft sections: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while drafting sections: {str(e)}",
        )


@router.get("/sources")
async def get_available_sources():
    """Get list of available paper sources"""
    return {
        "sources": [
            {
                "name": "arxiv",
                "description": "ArXiv paper repository (Computer Science, Physics, etc.)",
            },
            {
                "name": "pubmed",
                "description": "PubMed biomedical literature database",
            },
            {
                "name": "crossref",
                "description": "CrossRef - 150M+ academic articles",
            },
            {
                "name": "doaj",
                "description": "DOAJ - 20,000+ open access journals",
            },
            {
                "name": "ssrn",
                "description": "SSRN - Social Science Research Network",
            },
            {
                "name": "springer",
                "description": "Springer Nature metadata API (journals, books, proceedings)",
            },
            {
                "name": "ieee_xplore",
                "description": "IEEE Xplore digital library",
            },
            {
                "name": "semantic_scholar",
                "description": "Semantic Scholar - AI-powered research database",
            },
            
           
        ]
    }
@router.post("/generate_prompt")
async def generate_prompt(request: ResearchQueryRequest):
    """
    Generate a copy-ready academic prompt for external AI tools
    """
    agent = ResearchAgent()

    # 1. Search papers (LIVE, FREE)
    papers = agent._search_papers(
        request.query,
        ["arxiv", "pubmed", "crossref", "doaj"]  # free sources only
    )

    if not papers:
        return {
            "prompt": "No papers found. Please try a different query."
        }

    # 2. Load template
    template = get_template(request.template_id)

    # 3. Generate prompt
    prompt = prompt_generator.generate_prompt(
        query=request.query,
        papers=papers[:8],  # limit for stability
        template=template,
    )

    return {
        "prompt": prompt,
        "papers_used": len(papers)
    }
@router.get("/query_history")
async def query_history(user: str = Depends(get_current_user), limit: int = 30):
    cursor = query_history_col.find(
        {"email": user},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit)

    return {"history": list(cursor)}

DOI_RE = re.compile(r"\b10\.\d{4,9}/[^\s\"<>]+", re.IGNORECASE)

def extract_doi(text: str) -> Optional[str]:
    if not text:
        return None
    m = DOI_RE.search(text)
    if not m:
        return None
    doi = m.group(0).strip().rstrip(".,;)")
    return doi

def publisher_matches(publisher: str, source: str) -> bool:
    p = (publisher or "").lower()
    if source == "ieee":
        return "ieee" in p
    if source == "springer":
        return "springer" in p
    if source == "acm":
        return "association for computing machinery" in p or "acm" in p
    if source == "scopus":
        # Scopus has no free/public verification API; we’ll treat it as “not verifiable”
        return False
    return False

def source_display_name(source: str) -> str:
    return {
        "ieee": "IEEE Xplore",
        "springer": "SpringerLink",
        "acm": "ACM DL",
        "scopus": "Scopus",
    }.get(source, source)

def source_search_url(source: str, doi: Optional[str], title: Optional[str]) -> Optional[str]:
    q = doi or title
    if not q:
        return None
    enc = urllib.parse.quote(q)
    if source == "ieee":
        return f"https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={enc}"
    if source == "springer":
        return f"https://link.springer.com/search?query={enc}"
    if source == "acm":
        return f"https://dl.acm.org/action/doSearch?AllField={enc}"
    if source == "scopus":
        return "https://www.scopus.com/"  # requires subscription/login
    return None

def score_to_status(score: int) -> str:
    if score >= 80:
        return "verified"
    if score >= 70:
        return "partial"
    return "not_found"

@router.post("/verify_references", response_model=VerifyReferencesResponse)
async def verify_references(request: VerifyReferencesRequest) -> VerifyReferencesResponse:
    """
    Best-effort reference verification using DOI + Crossref metadata.
    - If DOI exists → verify via Crossref /works/{doi}
    - Else → try Crossref bibliographic search
    """
    results = []

    async with httpx.AsyncClient(timeout=20) as client:
        for raw in request.references:
            raw = (raw or "").strip()
            if not raw:
                continue

            doi = extract_doi(raw)

            title = None
            publisher = None
            confidence = 0

            # 1) Try DOI verification via Crossref
            if doi:
                cr_url = f"https://api.crossref.org/works/{urllib.parse.quote(doi)}"
                try:
                    r = await client.get(cr_url, headers={"User-Agent": "ResearchDost/1.0 (mailto:example@example.com)"})
                    if r.status_code == 200:
                        msg = r.json().get("message", {})
                        title_list = msg.get("title") or []
                        title = title_list[0] if title_list else None
                        publisher = msg.get("publisher")
                        confidence = 95
                    else:
                        confidence = 60
                except Exception:
                    confidence = 60

            # 2) If no DOI or DOI failed, do Crossref bibliographic query
            if not doi or confidence < 70:
                q = urllib.parse.quote(raw[:500])
                cr_search = f"https://api.crossref.org/works?rows=1&query.bibliographic={q}"
                try:
                    r = await client.get(cr_search, headers={"User-Agent": "ResearchDost/1.0 (mailto:example@example.com)"})
                    if r.status_code == 200:
                        items = r.json().get("message", {}).get("items", [])
                        if items:
                            item = items[0]
                            doi = doi or item.get("DOI")
                            t = item.get("title") or []
                            title = title or (t[0] if t else None)
                            publisher = publisher or item.get("publisher")
                            # Crossref doesn't give a direct “match score”; use heuristic
                            confidence = max(confidence, 82 if doi else 74)
                    else:
                        confidence = max(confidence, 55)
                except Exception:
                    confidence = max(confidence, 55)

            status = score_to_status(confidence)

            # Build matches for requested sources (IEEE/Springer/ACM best-effort via publisher)
            matches = []
            for src in request.sources:
                src = (src or "").lower()
                if src == "scopus":
                    # Without paid API key we cannot actually verify Scopus;
                    # keep it out of matches to avoid fake “verified”.
                    continue

                if publisher_matches(publisher or "", src) and confidence >= 70:
                    matches.append({
                        "source": src,
                        "sourceName": source_display_name(src),
                        "confidence": min(99, confidence),
                        "url": source_search_url(src, doi, title),
                    })

            results.append({
                "raw": raw,
                "status": status,
                "confidence": confidence,
                "doi": doi,
                "title": title,
                "matches": matches,
            })

    return {"results": results}