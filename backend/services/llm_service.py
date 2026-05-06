"""LLM Service - Interact with Claude for text generation (with safe fallbacks)"""

from typing import Optional, List, Dict
from config import get_settings
from services.template_service import get_template
from utils.logger import get_logger
import anthropic

logger = get_logger(__name__)
settings = get_settings()


class LLMService:
    """
    Service for interacting with Claude.

    IMPORTANT:
    - If the Anthropic API call fails for any reason (version mismatch, bad key, no network),
      we fall back to simple deterministic logic so the UI NEVER shows
      "I'm sorry, I could not generate a response due to an internal error."
    """

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY not set in environment")

        # This works for both old and new SDKs; we only rely on attributes in _call_claude
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.LLM_MODEL

        # Log SDK version for debugging
        ver = getattr(anthropic, "__version__", "unknown")
        logger.info(f"Initialized LLMService with anthropic SDK version: {ver}")
        if isinstance(ver, str) and ver != "unknown":
            try:
                parts = [int(p) for p in ver.split(".")[:3]]
                while len(parts) < 3:
                    parts.append(0)
                if tuple(parts) < (0, 20, 0):
                    logger.warning(
                        "Anthropic SDK is outdated (%s). Upgrade to >=0.20 for messages API. "
                        "Model %s may fail on legacy completions.",
                        ver,
                        self.model,
                    )
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Internal helper: try Claude, else return None (no error text)
    # ------------------------------------------------------------------
    def _call_claude(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.3,
    ) -> Optional[str]:
        """
        Call Claude using messages API if available; otherwise try completions API.
        On ANY error, log it and return None (caller will fall back).
        """
        try:
            # -------- New messages API (anthropic>=0.20) --------
            if hasattr(self.client, "messages"):
                resp = self.client.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                )

                pieces: List[str] = []
                for block in resp.content:
                    if getattr(block, "type", None) == "text":
                        pieces.append(block.text)
                    elif isinstance(block, dict) and block.get("type") == "text":
                        pieces.append(block.get("text", ""))

                text = "".join(pieces).strip()
                if text:
                    return text

            # -------- Legacy completions API (older SDKs) --------
            logger.warning("Falling back to Claude completions API (legacy)")

            prompt = (
                f"{anthropic.HUMAN_PROMPT}"
                f"System:\n{system_prompt}\n\n"
                f"User:\n{user_prompt}"
                f"{anthropic.AI_PROMPT}"
            )

            resp = self.client.completions.create(
                model=self.model,
                prompt=prompt,
                max_tokens_to_sample=max_tokens,
                temperature=temperature,
            )

            text = getattr(resp, "completion", "") or ""
            text = text.strip()
            return text or None

        except Exception as e:
            # Full stack trace in logs, but NEVER send this string to the UI
            logger.exception(f"Claude API error: {e}")
            return None

    # ------------------------------------------------------------------
    # Summaries (still cheap, non‑LLM, like your original code)
    # ------------------------------------------------------------------
    def summarize_paper(self, paper: dict, max_tokens: int = 300) -> str:
        """
        Summarize a research paper.

        For cost and robustness reasons, use the paper's abstract/summary directly,
        just like your original implementation.
        """
        try:
            if not paper.get("summary"):
                return f"Paper: {paper.get('title', 'Untitled')}"
            return paper["summary"]
        except Exception as e:
            logger.error(f"Error summarizing paper: {str(e)}")
            return f"Paper: {paper.get('title', 'Unknown')}"

    # ------------------------------------------------------------------
    # Answer research question
    # ------------------------------------------------------------------
    def answer_research_question(self, question: str, context: str, max_tokens: int = 700) -> str:
        """
        Return answer in human academic style when Claude works.
        If Claude fails, FALL BACK to your old simple context‑based answer.
        """
        if not context or len(context.strip()) < 10:
            return "No sufficient context available to answer this question. Please try a different query."

        logger.info(f"Answering research question for: {question}")

        system = (
            "You are an expert research assistant helping with literature reviews. "
            "Write clear, concise, well‑structured academic explanations in a natural, human style. "
            "Base your answer ONLY on the provided context from scientific papers."
        )

        user = f"""
Research question:
\"\"\"{question}\"\"\"

Context from relevant papers:
\"\"\"{context[:8000]}\"\"\"

Write a 3–6 paragraph synthetic answer summarising main ideas, methods and findings.
Use a natural academic tone (not robotic). Do not fabricate facts beyond the context.
"""

        text = self._call_claude(system, user, max_tokens=max_tokens)

        # ---- FALLBACK: original behaviour if Claude not available ----
        if not text:
            logger.warning("Claude unavailable, falling back to simple context-based answer")
            return (
                "Based on the research papers found:\n\n"
                + context[:1000]
                + "\n\nFor more detailed information, please refer to the paper summaries below."
            )

        return text

    # ------------------------------------------------------------------
    # Research notes (template‑aware, but safe fallback)
    # ------------------------------------------------------------------
    def generate_research_notes(
        self,
        query: str,
        papers: List[Dict],
        template_id: Optional[str] = None,
        max_tokens: int = 1400,
    ) -> str:
        """
        Generate structured notes; try Claude first, then deterministic fallback.
        """
        if not papers:
            return f"No papers found for query: {query}"

        logger.info("Generating research notes")

        # Build context from papers
        context_parts = []
        for i, p in enumerate(papers[:12], start=1):
            context_parts.append(
                f"[{i}] {p.get('title','Untitled')} ({p.get('published','Unknown')}) "
                f"- {', '.join(p.get('authors', [])[:3])}\n"
                f"Source: {p.get('source','Unknown')} | URL: {p.get('url','')}\n"
                f"Abstract/Summary: {p.get('summary','')}\n"
            )
        context_text = "\n".join(context_parts)

        template_hint = ""
        template_sections: List[str] = []
        if template_id:
            template = get_template(template_id)
            template_sections = template.get("sections", [])
            if template_sections:
                template_hint = (
                    "Use the following section headings (in order), and use them verbatim:\n"
                    + "\n".join([f"- {sec}" for sec in template_sections])
                    + "\n"
                )
            else:
                template_hint = (
                    f"Try to loosely follow the section style of template `{template_id}` "
                    f"(e.g., Introduction, Methodology, Results, Conclusion).\n"
                )

        system = (
            "You are an expert research assistant. Create structured research notes that "
            "a graduate student could use to write a survey paper. Use clear section headings and "
            "concise paragraphs. Use bullets only when they improve clarity. "
            "Write in clear, natural academic language (not robotic)."
        )

        user = f"""
Research topic:
\"\"\"{query}\"\"\"

Papers available:
{context_text}

{template_hint}
Return Markdown notes. Use a top-level title, then use these exact section headings in order.
For "Keywords", return a short comma-separated list.
For "References", list the paper titles with their numeric identifiers (e.g., [1] Title — Source).
Summarise main themes, methods, datasets, key results and limitations.
Use inline citations like [1], [2] when referring to particular papers.
"""

        text = self._call_claude(system, user, max_tokens=max_tokens)

        def _build_template_fallback() -> str:
            notes = f"# Research Notes on: {query}\n"

            # Lightweight keywords from query
            stop_words = {
                "the",
                "and",
                "for",
                "with",
                "from",
                "into",
                "using",
                "based",
                "their",
                "this",
                "that",
                "these",
                "those",
                "over",
                "under",
                "between",
                "across",
                "within",
                "toward",
                "towards",
                "about",
                "into",
                "between",
                "among",
                "via",
                "via",
                "in",
                "on",
                "of",
                "to",
                "a",
                "an",
                "is",
                "are",
            }
            keywords = []
            for token in query.replace("-", " ").split():
                token = token.strip().lower()
                if len(token) > 3 and token not in stop_words and token not in keywords:
                    keywords.append(token)
            keyword_line = ", ".join(keywords[:8]) if keywords else query

            references = []
            for i, paper in enumerate(papers[:12], 1):
                title = paper.get("title", "Untitled")
                source = paper.get("source", "Unknown")
                references.append(f"- [{i}] {title} — {source}")

            for sec in template_sections:
                lower = sec.lower()
                notes += f"\n## {sec}\n"

                if lower.startswith("keywords"):
                    notes += f"{keyword_line}\n"
                    continue

                if lower.startswith("references"):
                    notes += "\n".join(references) + "\n"
                    continue

                # Generic, minimal synthesis if LLM is unavailable
                notes += (
                    "This section should synthesise the key points from the papers above, "
                    "highlighting methods, datasets, and findings with inline citations like [1], [2].\n"
                )

            return notes

        # If template sections were provided but Claude omitted them, fall back to a deterministic structure
        if template_sections and text:
            missing = [sec for sec in template_sections if f"## {sec}" not in text]
            if missing:
                logger.warning("Claude response missing template sections; using structured fallback")
                text = _build_template_fallback()

        # ---- FALLBACK: original deterministic notes if Claude fails ----
        if not text:
            logger.warning("Claude unavailable, falling back to deterministic research notes")
            if template_sections:
                return _build_template_fallback()

            notes = f"""# Research Notes on: {query}

## Overview
Found {len(papers)} relevant papers on this topic from various sources.

## Key Papers Included
"""
            for i, paper in enumerate(papers[:10], 1):
                notes += f"\n{i}. **{paper.get('title','Untitled')}**\n"
                notes += f"   - Authors: {', '.join(paper.get('authors', ['Unknown'])[:3])}\n"
                notes += f"   - Source: {paper.get('source', 'Unknown')}\n"
                notes += f"   - Abstract: {paper.get('summary', 'N/A')[:200]}...\n"

            if template_sections:
                notes += "\n"
                for sec in template_sections:
                    if sec.lower().startswith("references"):
                        continue
                    notes += f"\n## {sec}\n"
                    notes += (
                        "Draft this section by synthesising key points from the papers above. "
                        "Cite sources with [1], [2] where relevant.\n"
                    )
            else:
                notes += f"""

## Summary
This collection covers the latest research and developments in {query}. The papers include both theoretical frameworks and practical applications.

## Recommendations
1. Start with foundational papers to understand core concepts
2. Review recent papers for latest developments
3. Check cited papers for deeper understanding
"""
            return notes

        return text

    # ------------------------------------------------------------------
    # Draft full sections for templates (again: safe fallback)
    # ------------------------------------------------------------------
    def generate_draft_sections(
        self,
        query: str,
        papers: List[Dict],
        template_id: str,
        sections: List[str],
        max_tokens_per_section: int = 550,
    ) -> Dict[str, str]:
        """
        Generate content for each requested section.
        If Claude is unavailable, we return generic guidance text instead of errors.
        """
        logger.info(f"Generating draft sections | template={template_id}")

        if not papers:
            return {sec: "No papers available to draft this section." for sec in sections}

        # Shared paper context
        context_parts = []
        for i, p in enumerate(papers[:10], start=1):
            context_parts.append(
                f"[{i}] {p.get('title','Untitled')} ({p.get('published','Unknown')}) "
                f"- {', '.join(p.get('authors', [])[:3])}\n"
                f"Source: {p.get('source','Unknown')} | URL: {p.get('url','')}\n"
                f"Abstract/Summary: {p.get('summary','')}\n"
            )
        context_text = "\n".join(context_parts)

        system = (
            "You are drafting sections of an academic paper based on real research papers. "
            "Write in a natural, human academic tone. Avoid generic filler and repetition."
        )

        out: Dict[str, str] = {}

        for sec in sections:
            user = f"""
You are writing the **{sec}** section of a paper.

Paper topic:
\"\"\"{query}\"\"\"

You have these relevant papers as your knowledge base:
{context_text}

Write the {sec} section in a natural academic style (not robotic).
- Aim for 2–5 concise paragraphs.
- Base your writing ONLY on the information from the papers above.
- Use inline citations like [1], [2] when referring to specific works.
- Do NOT invent datasets, experiments or results that are not in the context.
- Do NOT include a reference list, only inline citations.
"""

            text = self._call_claude(
                system_prompt=system,
                user_prompt=user,
                max_tokens=max_tokens_per_section,
                temperature=0.35,
            )

            # Fallback text if Claude fails
            if not text:
                logger.warning(f"Claude unavailable for section '{sec}', using fallback text")
                text = (
                    f"This section should summarise relevant content for **{sec}** based on the "
                    f"papers listed in the research results. Use the research notes and individual "
                    f"paper summaries from Research Dost to manually draft this part."
                )

            out[sec] = text

        return out
