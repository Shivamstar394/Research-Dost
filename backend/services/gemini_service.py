import google.generativeai as genai
from config import get_settings

settings = get_settings()

genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    def generate_notes(self, query, papers, template):

        papers_text = ""

        for i, p in enumerate(papers[:10], start=1):
            papers_text += f"""
[{i}] {p['title']}
Summary: {p.get('summary','')}
Year: {p.get('published','')}
Source: {p.get('source','')}
"""

        prompt = f"""
You are an academic research assistant.

Research Topic:
{query}

Using the papers below, generate structured research notes.

Follow this template style:
{template}

Papers:
{papers_text}

Requirements:
- Academic writing
- Include citations like [1], [2]
- Structured sections
"""

        response = self.model.generate_content(prompt)

        return response.text