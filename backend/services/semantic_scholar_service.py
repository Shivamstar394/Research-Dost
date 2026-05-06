import requests
import time
from typing import List, Dict, Any


class SemanticScholarService:

    BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:

        params = {
            "query": query,
            "limit": max_results,
            "fields": "title,authors,abstract,year,url"
        }

        for attempt in range(3):  # retry up to 3 times
            try:
                response = requests.get(
                    SemanticScholarService.BASE_URL,
                    params=params,
                    timeout=20
                )

                if response.status_code == 429:
                    wait_time = 5 * (attempt + 1)
                    print(f"Semantic Scholar rate limited. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()

                papers = []

                for item in data.get("data", []):
                    papers.append({
                        "source": "semantic_scholar",
                        "title": item.get("title", ""),
                        "authors": [a.get("name") for a in item.get("authors", [])],
                        "summary": item.get("abstract", "")[:500] if item.get("abstract") else "",
                        "published": item.get("year", "Unknown"),
                        "url": item.get("url", ""),
                    })

                return papers

            except requests.exceptions.RequestException as e:
                print(f"Semantic Scholar API error: {e}")
                time.sleep(2)

        return []