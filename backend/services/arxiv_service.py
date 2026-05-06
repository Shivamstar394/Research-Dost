"""
ArXiv Service - Fetch and process ArXiv papers (rate-limit safe)
"""

import requests
import time
from typing import List, Dict, Any
import feedparser
from utils.logger import get_logger
from utils.cache import cache

logger = get_logger(__name__)


class ArxivService:
    """Service for fetching and processing ArXiv papers"""

    BASE_URL = "https://export.arxiv.org/api/query"

    HEADERS = {
        # IMPORTANT: ArXiv requires a User-Agent
        "User-Agent": "ResearchDost/1.0 (shivam.mi7878@gmail.com)",
        "Accept": "application/atom+xml",
    }

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search ArXiv for papers matching the query
        """

        cached = cache.get(query, "arxiv")
        if cached:
            logger.info(f"Cache hit for ArXiv query: {query}")
            return cached

        try:
            logger.info(f"Searching ArXiv: {query}")

            params = {
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": max_results,
                "sortBy": "relevance",
                "sortOrder": "descending",
            }

            response = requests.get(
                ArxivService.BASE_URL,
                params=params,
                headers=ArxivService.HEADERS,
                timeout=20,
            )

            # Handle rate limit properly
            if response.status_code == 429:
                logger.warning("ArXiv rate limited (429). Waiting 5 seconds...")
                time.sleep(5)
                response = requests.get(
                    ArxivService.BASE_URL,
                    params=params,
                    headers=ArxivService.HEADERS,
                    timeout=20,
                )

            response.raise_for_status()

            feed = feedparser.parse(response.content)

            papers = []

            for entry in feed.entries:
                summary = entry.summary.replace("\n", " ").strip()

                if len(summary) < 50:
                    continue

                query_lower = query.lower()
                title_lower = entry.title.lower()
                summary_lower = summary.lower()

                query_words = query_lower.split()
                matches = sum(
                    1
                    for word in query_words
                    if len(word) > 3
                    and (word in title_lower or word in summary_lower)
                )

                if matches == 0:
                    continue

                paper = {
                    "source": "ArXiv",
                    "title": entry.title,
                    "authors": [author.name for author in entry.authors],
                    "summary": summary,
                    "published": entry.published,
                    "arxiv_id": entry.id.split("/abs/")[-1],
                    "url": entry.id,
                    "pdf_url": entry.id.replace("/abs/", "/pdf/") + ".pdf",
                }

                papers.append(paper)

            cache.set(query, "arxiv", papers)
            logger.info(f"Found {len(papers)} relevant papers on ArXiv")

            # Respect ArXiv rate limits
            time.sleep(1)

            return papers

        except requests.RequestException as e:
            logger.error(f"ArXiv API error: {str(e)}")
            return []

        except Exception as e:
            logger.error(f"Error parsing ArXiv response: {str(e)}")
            return []
