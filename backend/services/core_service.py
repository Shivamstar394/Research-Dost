import requests
from typing import List, Dict, Any

class COREService:

    BASE_URL = "https://api.core.ac.uk/v3/search/works"

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:

        try:
            response = requests.post(
                COREService.BASE_URL,
                json={"q": query, "limit": max_results},
                timeout=20,
            )

            response.raise_for_status()
            data = response.json()

            papers = []

            for item in data.get("results", []):
                papers.append(
                    {
                        "source": "CORE",
                        "title": item.get("title", ""),
                        "authors": item.get("authors", []),
                        "summary": item.get("abstract", "")[:500],
                        "published": item.get("yearPublished", "Unknown"),
                        "url": item.get("downloadUrl", ""),
                    }
                )

            return papers

        except:
            return []
