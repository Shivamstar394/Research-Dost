import requests
from typing import List, Dict, Any
from config import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class IEEEXploreService:

    BASE_URL = "https://ieeexploreapi.ieee.org/api/v1/search/articles"

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:

        if not settings.IEEE_API_KEY:
            logger.warning("IEEE API key not configured.")
            return []

        try:
            params = {
                "apikey": settings.IEEE_API_KEY,
                "format": "json",
                "max_records": max_results,
                "querytext": query,
                "sort_order": "desc",
            }

            response = requests.get(IEEEXploreService.BASE_URL, params=params, timeout=20)
            response.raise_for_status()

            data = response.json()
            articles = data.get("articles", [])

            papers = []

            for article in articles:
                papers.append(
                    {
                        "source": "IEEE Xplore",
                        "title": article.get("title", ""),
                        "authors": [a.get("full_name") for a in article.get("authors", {}).get("authors", [])],
                        "summary": article.get("abstract", "")[:500],
                        "published": article.get("publication_year", "Unknown"),
                        "url": article.get("html_url", ""),
                    }
                )

            return papers

        except Exception as e:
            logger.error(f"IEEE API error: {str(e)}")
            return []
