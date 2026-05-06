from openai import OpenAI
from config import get_settings

settings = get_settings()

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class OpenAIService:

    @staticmethod
    def generate_notes(query, papers, template):

        papers_text = ""

        for p in papers[:10]:
            papers_text += f"""
Title: {p['title']}
Summary: {p['summary']}
Year: {p['published']}
Source: {p['source']}
"""

        prompt = f"""
You are an academic research assistant.

User research topic:
{query}

Using the following papers, generate structured research notes.

Papers:
{papers_text}

Structure the notes according to this template:

{template}

Include citations like [1], [2].
Write academically.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an academic research assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )

        return response.choices[0].message.content