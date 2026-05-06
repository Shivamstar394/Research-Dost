from typing import List, Dict, Any

class SSRNService:

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        # SSRN unofficial API is unreliable
        return []
