import requests
import xml.etree.ElementTree as ET
import time
from typing import List, Dict, Any
from utils.logger import get_logger
from utils.cache import cache

logger = get_logger(__name__)


class PubmedService:
    """Service for fetching and processing PubMed papers"""

    SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    DB = "pubmed"

    HEADERS = {
        "User-Agent": "ResearchDost/1.0 (shivam.mi7878@gmail.com)",
        "Accept": "application/json",
    }

    @staticmethod
    def search_papers(query: str, max_results: int = 10) -> List[Dict[str, Any]]:

        cached = cache.get(query, "pubmed")
        if cached:
            logger.info(f"Cache hit for PubMed query: {query}")
            return cached

        try:
            logger.info(f"Searching PubMed: {query}")

            search_params = {
                "db": PubmedService.DB,
                "term": query,
                "retmax": max_results,
                "retmode": "json",
                "sort": "pub date",
            }

            response = requests.get(
                PubmedService.SEARCH_URL,
                params=search_params,
                headers=PubmedService.HEADERS,
                timeout=20,
            )

            response.raise_for_status()

            if not response.text.strip():
                logger.warning("PubMed returned empty response.")
                return []

            data = response.json()
            pmids = data.get("esearchresult", {}).get("idlist", [])

            if not pmids:
                logger.info("No PubMed results found.")
                return []

            time.sleep(1)

            papers = PubmedService._fetch_papers(pmids)

            cache.set(query, "pubmed", papers)
            logger.info(f"Found {len(papers)} papers on PubMed")

            return papers

        except Exception as e:
            logger.error(f"PubMed API error: {str(e)}")
            return []

    @staticmethod
    def _fetch_papers(pmids: List[str]) -> List[Dict[str, Any]]:

        try:
            fetch_params = {
                "db": PubmedService.DB,
                "id": ",".join(pmids),
                "retmode": "xml",
            }

            response = requests.get(
                PubmedService.FETCH_URL,
                params=fetch_params,
                headers=PubmedService.HEADERS,
                timeout=20,
            )

            response.raise_for_status()

            if not response.text.strip():
                logger.warning("PubMed fetch returned empty XML.")
                return []

            root = ET.fromstring(response.content)

            papers = []

            for article in root.findall(".//PubmedArticle"):
                medline = article.find(".//MedlineCitation")
                if medline is None:
                    continue

                pmid = medline.findtext("PMID", "")
                title = medline.findtext(".//ArticleTitle", "")

                abstract_elements = medline.findall(".//AbstractText")
                abstract_text = " ".join(
                    [el.text for el in abstract_elements if el.text]
                )

                authors = []
                for author in medline.findall(".//Author"):
                    last = author.findtext("LastName", "")
                    first = author.findtext("ForeName", "")
                    full_name = f"{first} {last}".strip()
                    if full_name:
                        authors.append(full_name)

                year = medline.findtext(".//PubDate/Year", "Unknown")

                papers.append(
                    {
                        "source": "PubMed",
                        "title": title,
                        "authors": authors,
                        "summary": abstract_text[:500] if abstract_text else "No abstract available",
                        "published": year,
                        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    }
                )

            time.sleep(1)

            return papers

        except Exception as e:
            logger.error(f"Error fetching PubMed papers: {str(e)}")
            return []
