"""Springer Nature Service - Fetch and process Springer papers"""

import requests
from typing import List, Dict, Any
from config import get_settings
from utils.logger import get_logger
from utils.cache import cache

logger = get_logger(__name__)
settings = get_settings()


class SpringerService:
    """Service for fetching and processing Springer Nature metadata"""

    BASE_URL = "https://api.springernature.com/metadata/json"

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search Springer Nature metadata for papers matching the query.
        Requires SPRINGER_API_KEY in environment.
        """
        cached = cache.get(query, "springer")
        if cached:
            logger.info(f"Cache hit for Springer query: {query}")
            return cached

        if not settings.SPRINGER_API_KEY:
            logger.warning("SPRINGER_API_KEY not configured; skipping Springer search")
            return []

        try:
            params = {
                "q": query,
                "api_key": settings.SPRINGER_API_KEY,
                "p": max_results,
            }

            logger.info(f"Searching Springer Nature: {query}")
            response = requests.get(SpringerService.BASE_URL, params=params, timeout=20)
            response.raise_for_status()

            data = response.json()
            records = data.get("records", []) or []
            papers: List[Dict[str, Any]] = []

            for item in records:
                title = item.get("title") or "Untitled"
                abstract = item.get("abstract") or item.get("summary") or "No abstract available"
                if abstract and len(abstract) > 500:
                    abstract = abstract[:500]

                creators = item.get("creators") or []
                authors = [c.get("creator") for c in creators if isinstance(c, dict) and c.get("creator")]

                url = item.get("url", [])
                url_value = ""
                if isinstance(url, list) and url:
                    url_value = url[0].get("value", "")
                elif isinstance(url, str):
                    url_value = url

                papers.append(
                    {
                        "source": "Springer",
                        "title": title,
                        "authors": authors or ["Unknown"],
                        "summary": abstract,
                        "published": item.get("publicationDate", "Unknown"),
                        "url": url_value,
                        "doi": item.get("doi", ""),
                    }
                )

            cache.set(query, "springer", papers)
            logger.info(f"Found {len(papers)} papers on Springer Nature")
            return papers

        except requests.RequestException as e:
            logger.error(f"Springer API error: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error parsing Springer response: {str(e)}")
            return []
