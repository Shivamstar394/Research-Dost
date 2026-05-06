"""
Prompt Generator Service
Generates copy-ready academic prompts for external AI tools
"""

from typing import List, Dict


class PromptGenerator:
    def generate_prompt(
        self,
        query: str,
        papers: List[Dict],
        template: Dict,
    ) -> str:
        sections = template.get("sections", [])

        paper_block = []
        for i, p in enumerate(papers, 1):
            paper_block.append(
                f"[{i}] {p.get('title','Untitled')} ({p.get('published','Unknown')})\n"
                f"Authors: {', '.join(p.get('authors', []))}\n"
                f"Abstract: {p.get('summary','')}\n"
                f"Source: {p.get('source','')}\n"
            )

        return f"""
You are an expert academic research assistant.

TASK:
Write a complete research paper.

TOPIC:
{query}

LATEST RESEARCH PAPERS (USE ONLY THESE):
{chr(10).join(paper_block)}

PAPER STRUCTURE:
Use the following sections EXACTLY and in order:
{", ".join(sections)}

WRITING GUIDELINES:
- Formal academic tone
- Human-like, non-robotic writing
- Use inline citations like [1], [2]
- Do NOT invent studies, datasets, or results
- End with a References section
"""
