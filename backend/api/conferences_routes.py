from fastapi import APIRouter, HTTPException
from datetime import date, datetime
from pathlib import Path
from typing import Optional, List, Dict
from services.openreview_conference import get_live_conferences
import json

router = APIRouter(tags=["Conferences"])

@router.get("/conferences/live")
async def list_conferences_live():
    try:
        items = await get_live_conferences()
        return {"conferences": items, "source": "wikidata"}
    except Exception as e:
        # ✅ return JSON error instead of crashing
        raise HTTPException(status_code=502, detail=str(e))

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "conferences.json"

def compute_deadline_status(submission_deadline: str) -> str:
    d = datetime.strptime(submission_deadline, "%Y-%m-%d").date()
    today = date.today()
    days_left = (d - today).days
    if days_left < 0:
        return "closed"
    if days_left <= 14:
        return "closing_soon"
    return "open"

def load_conferences() -> List[Dict]:
    if not DATA_PATH.exists():
        raise HTTPException(status_code=500, detail=f"Missing conferences dataset: {DATA_PATH}")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/conferences")
def list_conferences(
    publisher: Optional[str] = None,  # ieee | springer | acm | other | all
    category: Optional[str] = None,   # ai_ml | cs | healthcare | bfsi | all
):
    items = load_conferences()

    if publisher and publisher != "all":
        items = [c for c in items if c.get("publisher") == publisher]

    if category and category != "all":
        items = [c for c in items if c.get("category") == category]

    out = []
    for c in items:
        c2 = dict(c)
        try:
            c2["deadlineStatus"] = compute_deadline_status(c2["submissionDeadline"])
        except Exception:
            # If date format is wrong in JSON, don't break the endpoint
            c2["deadlineStatus"] = "open"
        out.append(c2)

    # Sort: IEEE & Springer first, then others; and by submission deadline
    publisher_priority = {"ieee": 0, "springer": 1, "acm": 2, "other": 3}
    def sort_key(x):
        pr = publisher_priority.get(x.get("publisher", "other"), 99)
        try:
            d = datetime.strptime(x["submissionDeadline"], "%Y-%m-%d").date()
        except Exception:
            d = date.max
        return (pr, d)

    out.sort(key=sort_key)

    return {"conferences": out, "source": "curated_json"}