"""
Research Agent - Main orchestrator for autonomous research
"""

from typing import Dict, Any, List, Optional, TYPE_CHECKING
import time

from services.arxiv_service import ArxivService
from services.pubmed_service import PubmedService
from services.rag_service import RAGService
from services.llm_service import LLMService
from services.ssrn_service import SSRNService
from services.crossref_service import CrossRefService
from services.doaj_service import DOAJService
from services.springer_service import SpringerService
from services.ieee_xplore_service import IEEEXploreService
from services.template_service import build_ieee_latex_from_sections
from services.semantic_scholar_service import SemanticScholarService


from utils.logger import get_logger
from config import get_settings

if TYPE_CHECKING:
    from api.models import DraftSectionsRequest

logger = get_logger(__name__)
settings = get_settings()


class ResearchAgent:
    """Main autonomous research agent"""

    def __init__(self):
        self.arxiv_service = ArxivService()
        self.pubmed_service = PubmedService()
        self.rag_service = RAGService()
        self.llm_service = LLMService()
        self.ssrn_service = SSRNService()
        self.crossref_service = CrossRefService()
        self.doaj_service = DOAJService()
        self.springer_service = SpringerService()
        self.ieee_xplore_service = IEEEXploreService()
        self.semantic_scholar_service = SemanticScholarService()
        
        
    
    # -------------------------------------------------
    # Main research pipeline
    # -------------------------------------------------
    def research(
        self,
        query: str,
        sources: Optional[List[str]] = None,
        template_id: Optional[str] = None,
    ) -> Dict[str, Any]:

        if sources is None:
            sources = ["arxiv", "pubmed", "crossref", "doaj", "ssrn", "springer", "ieee_xplore", "semantic_scholar"]

        logger.info(f"Starting research for query: {query} | sources={sources}")

        papers = self._search_papers(query, sources)

        if not papers:
            logger.warning(f"No papers found for query: {query}")
            return {
                "query": query,
                "status": "no_results",
                "message": "No papers found for the given query",
            }

        # Build RAG index
        self.rag_service.build_index(papers)

        # Retrieve relevant chunks
        relevant_chunks = self.rag_service.retrieve(query, top_k=settings.TOP_K_CHUNKS)
        context_text = "\n\n".join(chunk["text"] for chunk in relevant_chunks)

        # Research notes
        research_notes = self.llm_service.generate_research_notes(
            query=query,
            papers=papers,
            template_id=template_id,
        )

        # Final answer
        answer = self.llm_service.answer_research_question(
            question=query,
            context=context_text,
        )

        # Paper summaries
        paper_summaries = []
        for paper in papers[: settings.TOP_K_PAPERS]:
            summary = self.llm_service.summarize_paper(paper)
            paper_summaries.append(
                {
                    "title": paper["title"],
                    "authors": paper.get("authors", []),
                    "source": paper.get("source", "Unknown"),
                    "url": paper.get("url", ""),
                    "summary": summary,
                    "published": paper.get("published", None),
                }
            )

        logger.info(f"Research completed for query: {query}")

        return {
            "query": query,
            "status": "success",
            "papers_found": len(papers),
            "answer": answer,
            "research_notes": research_notes,
            "paper_summaries": paper_summaries,
            "sources_used": list({p["source"] for p in papers}),
        }

    # -------------------------------------------------
    # Draft sections
    # -------------------------------------------------
    def draft_sections(self, req: "DraftSectionsRequest") -> Dict[str, Any]:

        logger.info(f"Drafting sections for query: {req.query}")

        base_sources = ["arxiv", "pubmed", "crossref", "doaj"]
        papers = self._search_papers(req.query, sources=base_sources)

        if not papers:
            return {
                "sections": {sec: "No papers found for this topic." for sec in req.sections},
                "markdown": "",
                "latex_ieee": None,
            }

        top_papers = papers[: req.top_papers]

        sections_content = self.llm_service.generate_draft_sections(
            query=req.query,
            papers=top_papers,
            template_id=req.template_id,
            sections=req.sections,
        )

        md_parts = [f"# {req.query}\n"]
        for sec in req.sections:
            md_parts.append(f"## {sec}\n\n{sections_content.get(sec, '')}\n")

        markdown = "\n".join(md_parts).strip()

        latex_ieee = None
        if req.template_id == "ieee":
            latex_ieee = build_ieee_latex_from_sections(
                title=req.query,
                authors="",
                sections=sections_content,
            )

        return {
            "sections": sections_content,
            "markdown": markdown,
            "latex_ieee": latex_ieee,
        }

    # -------------------------------------------------
    # Query Type Detection
    # -------------------------------------------------
    def _is_medical_query(self, query: str) -> bool:
        """
        Detect whether query is medical / biomedical related.
        """

        medical_keywords = [
            "disease", "clinical", "patient", "therapy", "treatment",
            "drug", "medicine", "health", "hospital", "diagnosis",
            "cancer", "tumor", "cardiology", "neurology",
            "infection", "virus", "vaccine", "genetics",
            "biomedical", "epidemiology", "public health",
            "surgery", "pharmacology", "covid", "diabetes",
            "hypertension", "symptom", "microbiology",
            "immune", "pathology", "radiology", "oncology", "tuberculosis", "hiv", "aids", "mental health", "psychiatry", "psychology", "neuroscience", "gastroenterology", "endocrinology", "rheumatology", "dermatology", "ophthalmology", "pediatrics", "geriatrics", "obstetrics", "gynecology", "orthopedics", "anesthesiology", "emergency medicine", "family medicine", "internal medicine", "physical therapy", "rehabilitation", "nutrition", "public health", "epidemiology", "virology", "immunology", "genomics", "proteomics", "metabolomics", "biotechnology", "bioinformatics", "clinical trial", "randomized controlled trial", "systematic review", "meta-analysis", "case report", "case series", "cohort study", "cross-sectional study", "longitudinal study", "observational study", "experimental study", "translational research", "precision medicine", "personalized medicine", "healthcare", "wellness", "disease prevention", "health promotion", "pharmacotherapy", "drug development", "adverse effect", "side effect", "contraindication", "comorbidity", "mortality", "morbidity", "quality of life", "survival rate", "diagnostic test", "biomarker", "genetic mutation", "epigenetics", "microbiome", "neurodegenerative", "cardiovascular", "respiratory", "gastrointestinal", "endocrine", "musculoskeletal", "dermatological", "ophthalmic", "pediatric", "geriatric",
        ]

        query_lower = query.lower()

        matches = sum(
            1 for keyword in medical_keywords
            if keyword in query_lower
        )

        return matches >= 1

    # -------------------------------------------------
    # Internal search (rate-limit safe + medical aware)
    # -------------------------------------------------
    def _search_papers(self, query: str, sources: List[str]) -> List[Dict[str, Any]]:

        papers: List[Dict[str, Any]] = []

        is_medical = self._is_medical_query(query)
        logger.info(f"Medical query detected: {is_medical}")

        services = [
            ("arxiv", self.arxiv_service, 20),
            ("pubmed", self.pubmed_service, 10),
            ("crossref", self.crossref_service, 10),
            ("doaj", self.doaj_service, 10),
            ("ssrn", self.ssrn_service, 10),
            ("springer", self.springer_service, 10),
            ("ieee_xplore", self.ieee_xplore_service, 10),
            ("semantic_scholar", self.semantic_scholar_service, 20),
            
        ]

        # 🔥 Intelligent filtering logic
        filtered_services = []

        for name, service, limit in services:

            if name not in sources:
                continue

            # If query is medical → allow PubMed + general academic sources
            if is_medical:
                if name in ["pubmed",]:
                    filtered_services.append((name, service, limit))
            else:
                # If NOT medical → exclude PubMed
                if name != "pubmed":
                    filtered_services.append((name, service, limit))

        # 🔥 Call APIs safely with rate limiting
        for name, service, limit in filtered_services:
            try:
                logger.info(f"Searching {name}...")
                results = service.search_papers(query, max_results=limit)
                papers.extend(results)
                logger.info(f"{name}: Found {len(results)} papers")
                time.sleep(1)  # rate limit protection
            except Exception as e:
                logger.error(f"{name} search failed: {str(e)}")

        # 🔥 Deduplicate by title
        seen_titles = set()
        unique_papers = []

        for paper in papers:
            title = paper.get("title")
            if title and title not in seen_titles:
                unique_papers.append(paper)
                seen_titles.add(title)

        # 🔥 Sort by year (latest first)
        def extract_year(p):
            published = p.get("published")
            if not published:
                return 0
            try:
                if isinstance(published, int):
                    return published
                if isinstance(published, str):
                    for token in published.split("-"):
                        if token.isdigit() and len(token) == 4:
                            return int(token)
            except Exception:
                return 0
            return 0

        unique_papers.sort(key=extract_year, reverse=True)

        logger.info(f"Total unique papers found: {len(unique_papers)}")

        return unique_papers

