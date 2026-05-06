from typing import Dict, List

# Registry of supported templates
TEMPLATES: Dict[str, Dict] = {
    "ieee": {
        "name": "IEEE Conference Paper",
        "sections": [
            "Abstract",
            "Keywords",
            "I. Introduction",
            "II. Related Work",
            "III. Methodology",
            "IV. Experiments and Results",
            "V. Conclusion and Future Work",
            "References",
        ],
        "format": "latex_ieee",
    },
    "springer": {
        "name": "Springer / LNCS Article",
        "sections": [
            "Abstract",
            "Keywords",
            "1 Introduction",
            "2 Background and Related Work",
            "3 Method",
            "4 Results",
            "5 Discussion",
            "6 Conclusion",
            "References",
        ],
        "format": "markdown",
    },
    "acm": {
        "name": "ACM Article",
        "sections": [
            "Abstract",
            "Keywords",
            "1 Introduction",
            "2 Background",
            "3 Methods",
            "4 Results",
            "5 Discussion",
            "6 Conclusion and Future Work",
            "References",
        ],
        "format": "markdown",
    },
    "elsevier": {
        "name": "Elsevier / Generic Journal",
        "sections": [
            "Abstract",
            "Keywords",
            "1 Introduction",
            "2 Materials and Methods",
            "3 Results",
            "4 Discussion",
            "5 Conclusion",
            "References",
        ],
        "format": "markdown",
    },
    "imrad": {
        "name": "Generic IMRaD",
        "sections": [
            "Abstract",
            "Keywords",
            "Introduction",
            "Methods",
            "Results",
            "Discussion",
            "Conclusion",
            "References",
        ],
        "format": "markdown",
    },
}


def get_template(template_id: str) -> Dict:
    """Return template config or empty dict."""
    return TEMPLATES.get(template_id, {})


def build_ieee_latex_from_sections(title: str, authors: str, sections: Dict[str, str]) -> str:
    """
    Build a minimal IEEE two-column LaTeX document from section contents.
    """
    safe_title = title or "Paper Title"
    safe_authors = authors or "Author Name(s)"

    header = rf"""\documentclass[conference]{{IEEEtran}}
\usepackage{{cite}}
\usepackage{{amsmath,amssymb}}
\usepackage{{graphicx}}
\usepackage{{hyperref}}

\begin{{document}}

\title{{{safe_title}}}

\author{{{safe_authors}}}

\maketitle

"""

    body_parts: List[str] = []

    for sec_title, content in sections.items():
        lower = sec_title.lower()
        if lower.startswith("abstract"):
            body_parts.append("\\begin{abstract}\n" + content + "\n\\end{abstract}\n")
        elif lower.startswith("keywords"):
            body_parts.append("\\begin{IEEEkeywords}\n" + content + "\n\\end{IEEEkeywords}\n")
        else:
            clean_title = (
                sec_title.replace("I. ", "")
                .replace("II. ", "")
                .replace("III. ", "")
                .replace("IV. ", "")
                .replace("V. ", "")
            )
            body_parts.append("\\section{" + clean_title + "}\n" + content + "\n")

    footer = "\\bibliographystyle{IEEEtran}\n% \\bibliography{yourbibfile}\n\n\\end{document}\n"

    return header + "\n".join(body_parts) + footer