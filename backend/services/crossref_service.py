"""
CrossRef Service - Fetch papers from CrossRef API
"""

import requests
import re
from typing import List, Dict, Any
from utils.logger import get_logger

logger = get_logger(__name__)


class CrossRefService:

    BASE_URL = "https://api.crossref.org/works"

    @staticmethod
    def _clean_html(text: str) -> str:
        """Remove HTML tags from abstract."""
        if not text:
            return ""
        clean = re.sub(r"<.*?>", "", text)
        return clean.strip()

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        try:
            logger.info(f"Searching CrossRef: {query}")

            params = {
                "query": query,
                "rows": max_results,
                "sort": "relevance",
                "order": "desc",
            }

            headers = {
                "User-Agent": "ResearchDost/1.0 (mailto:your_email@example.com)"
            }

            response = requests.get(
                CrossRefService.BASE_URL,
                params=params,
                headers=headers,
                timeout=20
            )

            response.raise_for_status()
            data = response.json()

            items = data.get("message", {}).get("items", [])

            papers = []

            for item in items:
                title = item.get("title", [])
                title = title[0] if title else "No Title"

                authors = []
                for author in item.get("author", []):
                    given = author.get("given", "")
                    family = author.get("family", "")
                    full_name = f"{given} {family}".strip()
                    if full_name:
                        authors.append(full_name)

                abstract_raw = item.get("abstract", "")
                abstract = CrossRefService._clean_html(abstract_raw)

                # Fallback if no abstract
                if not abstract or len(abstract) < 50:
                    abstract = f"Paper: {title}"

                published_year = None
                if "issued" in item:
                    date_parts = item["issued"].get("date-parts", [])
                    if date_parts and len(date_parts[0]) > 0:
                        published_year = date_parts[0][0]

                papers.append({
                    "source": "CrossRef",
                    "title": title,
                    "authors": authors,
                    "summary": abstract,
                    "published": published_year,
                    "url": item.get("URL", ""),
                })

            logger.info(f"CrossRef: Found {len(papers)} papers")
            return papers

        except Exception as e:
            logger.error(f"CrossRef search failed: {str(e)}")
            return []
