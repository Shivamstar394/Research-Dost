import httpx
from pathlib import Path
import json, time

CACHE_FILE = Path("data/wikidata_conferences_cache.json")
CACHE_TTL_SECONDS = 12 * 3600

WIKIDATA_URL = "https://query.wikidata.org/sparql"

QUERY = """
SELECT ?conf ?confLabel ?start ?end ?website ?locationLabel ?topicLabel WHERE {
  ?conf wdt:P31/wdt:P279* wd:Q2020153 .
  ?conf wdt:P580 ?start .
  OPTIONAL { ?conf wdt:P582 ?end . }
  OPTIONAL { ?conf wdt:P856 ?website . }
  OPTIONAL { ?conf wdt:P276 ?location . }
  OPTIONAL { ?conf wdt:P921 ?topic . }
  FILTER(?start >= NOW())
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?start
LIMIT 80
"""

def _cache_valid() -> bool:
    return CACHE_FILE.exists() and (time.time() - CACHE_FILE.stat().st_mtime) < CACHE_TTL_SECONDS

def _read_cache():
    try:
        if not CACHE_FILE.exists():
            return None
        txt = CACHE_FILE.read_text(encoding="utf-8").strip()
        if not txt:
            return None
        return json.loads(txt)
    except Exception:
        return None

def _write_cache(items):
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")

def infer_category(name: str = "", topic: str = "") -> str:
    s = (name + " " + topic).lower()
    if any(k in s for k in ["machine learning", "deep learning", "neural", "ai", "artificial intelligence"]):
        return "ai_ml"
    if any(k in s for k in ["computer", "software", "network", "security", "database", "informatics"]):
        return "cs"
    if any(k in s for k in ["medical", "medicine", "clinical", "health", "hospital", "biomedical", "pharma"]):
        return "healthcare"
    if any(k in s for k in ["finance", "bank", "insurance", "trading", "fintech"]):
        return "bfsi"
    return "other"

async def get_live_conferences():
    # ✅ return cache if valid and readable
    if _cache_valid():
        cached = _read_cache()
        if cached is not None:
            return cached

    headers = {
        # ✅ correct accept type for SPARQL JSON
        "Accept": "application/sparql-results+json",
        # ✅ Wikidata requires a User-Agent; without it you may get HTML/blocked response
        "User-Agent": "ResearchDost/1.0 (local dev)"
    }

    params = {
        "query": QUERY,
        "format": "json"   # ✅ forces JSON output
    }

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        r = await client.get(WIKIDATA_URL, params=params, headers=headers)

    # If rate-limited or blocked, Wikidata may return HTML/text (not JSON)
    ctype = (r.headers.get("content-type") or "").lower()
    if r.status_code != 200:
        raise RuntimeError(f"Wikidata error {r.status_code}: {r.text[:200]}")
    if "json" not in ctype:
        raise RuntimeError(f"Wikidata returned non-JSON ({ctype}): {r.text[:200]}")

    data = r.json()

    out = []
    for b in data.get("results", {}).get("bindings", []):
        name = b.get("confLabel", {}).get("value", "")
        topic = b.get("topicLabel", {}).get("value", "")
        start = b.get("start", {}).get("value")
        end = b.get("end", {}).get("value")
        website = b.get("website", {}).get("value")

        out.append({
            "id": b.get("conf", {}).get("value", name),
            "name": name,
            "fullName": name,
            "category": infer_category(name, topic),
            "publisher": "other",
            "date": f"{start[:10]} to {end[:10]}" if (start and end) else (start[:10] if start else "TBA"),
            "location": b.get("locationLabel", {}).get("value", "TBA"),
            "submissionDeadline": None,
            "notificationDate": None,
            "submissionLink": website,
            "website": website,
            "deadlineStatus": "open",
            "topics": [topic] if topic else [],
            "tier": "—",
            "source": "wikidata",
        })

    _write_cache(out)
    return out