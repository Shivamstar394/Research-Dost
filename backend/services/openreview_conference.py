import openreview
from datetime import datetime

client = openreview.Client(
    baseurl="https://api.openreview.net"
)

AI_CONFERENCES = [
    "NeurIPS.cc",
    "ICLR.cc",
    "ICML.cc",
    "CVPR.cc",
    "ACLweb.org",
    "EMNLP",
    "AAAI.org",
    "IEEECVPR",
]

def infer_tier(name: str):
    top = ["NeurIPS", "ICLR", "ICML", "CVPR", "ACL"]
    if any(t.lower() in name.lower() for t in top):
        return "A*"
    return "A"

async def get_live_conferences():
    conferences = []

    current_year = datetime.now().year

    for conf in AI_CONFERENCES:
        try:
            groups = client.get_groups(
                id=f"{conf}/{current_year}/Conference"
            )

            for g in groups:

                name = g.id.split("/")[0]

                conferences.append({
                    "id": g.id,
                    "name": name,
                    "fullName": name,
                    "category": "ai_ml",
                    "publisher": "OpenReview",
                    "date": f"{current_year}",
                    "location": "Varies yearly",
                    "submissionDeadline": "Check website",
                    "notificationDate": "Check website",
                    "submissionLink": f"https://openreview.net/group?id={g.id}",
                    "website": f"https://openreview.net/group?id={g.id}",
                    "deadlineStatus": "open",
                    "topics": ["AI", "Machine Learning"],
                    "tier": infer_tier(name),
                    "source": "openreview",
                })

        except Exception as e:
            print(f"OpenReview error for {conf}: {e}")

    return conferences