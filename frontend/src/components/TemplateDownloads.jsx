import React, { useState } from "react";

function downloadTextFile(filename, content) {
  const blob = new Blob([content || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const OFFICIAL_LINKS = {
  ieee: "https://www.ieee.org/conferences/publishing/templates.html",
  springer:
    "https://www.springer.com/gp/computer-science/lncs/conference-proceedings-guidelines",
  acm: "https://www.acm.org/publications/proceedings-template",
  elsevier:
    "https://www.elsevier.com/researcher/author/policies-and-guidelines/latex-instructions",
};
const OVERLEAF_LINKS = {
  ieee: "https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhkpffhf",
  springer: "https://www.overleaf.com/latex/templates/springer-lecture-notes-in-computer-science/kzwwpvhwnvfj",
  acm: "https://www.overleaf.com/latex/templates/acm-conference-proceedings-primary-article/wbvnghjbzwpc",
  elsevier: "https://www.overleaf.com/latex/templates/elsevier-article-class/zzqdswzjscpy",
};
const DOWNLOADS = [
  // IEEE
  {
    id: "ieee_tex",
    label: "IEEE LaTeX Starter (.tex)",
    href: "/downloads/ieee-template.tex",
  },
  {
    id: "ieee_pdf",
    label: "IEEE Sample Paper (PDF)",
    href: "/downloads/ieee-sample.pdf",
  },

  // Springer
  {
    id: "springer_tex",
    label: "Springer LNCS Starter (.tex)",
    href: "/downloads/springer-lncs-template.tex",
  },
  {
    id: "springer_pdf",
    label: "Springer LNCS Sample (PDF)",
    href: "/downloads/springer-sample.pdf",
  },

  // ACM
  {
    id: "acm_tex",
    label: "ACM SIGCONF Starter (.tex)",
    href: "/downloads/acm-sigconf-template.tex",
  },
  {
    id: "acm_pdf",
    label: "ACM SIGCONF Sample (PDF)",
    href: "/downloads/acm-sample.pdf",
  },

  // Elsevier
  {
    id: "elsevier_tex",
    label: "Elsevier elsarticle Starter (.tex)",
    href: "/downloads/elsevier-elsarticle-template.tex",
  },
  {
    id: "elsevier_pdf",
    label: "Elsevier Sample (PDF)",
    href: "/downloads/elsevier-sample.pdf",
  },
];

function DownloadIcon() {
  return (
    <svg
      className="td-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4.01 4a1 1 0 0 1-1.38 0l-4.01-4a1 1 0 1 1 1.4-1.42L11 13.59V4a1 1 0 0 1 1-1z"
        fill="currentColor"
      />
      <path
        d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function TemplateDownloads({ templateId, aiLatex, aiMarkdown }) {
  const [downloadingId, setDownloadingId] = useState("");

  const flashDownloading = (id) => {
    setDownloadingId(id);
    window.setTimeout(() => setDownloadingId(""), 1200);
  };

  return (
    <div className="content-card mt-4">
      <h3 className="cc-heading">📦 Template Downloads</h3>
      <p className="ws-desc">
        Download sample PDFs and starter LaTeX (.tex) templates for IEEE, Springer LNCS, ACM SIGCONF, and Elsevier.
      </p>

      {/* AI export buttons (optional, keep if you want) */}
      <div className="td-list">
        <button
          className="td-row"
          type="button"
          onClick={() => {
            flashDownloading("ai_md");
            downloadTextFile("research-dost-draft.md", aiMarkdown);
          }}
          disabled={!aiMarkdown}
        >
          <span className="td-left">
            Download AI Markdown (.md)
            {!aiMarkdown && <span className="td-muted"> (generate first)</span>}
          </span>
          <span className="td-right">
            {downloadingId === "ai_md" ? <span className="td-spin" /> : <DownloadIcon />}
          </span>
        </button>

        <button
          className="td-row"
          type="button"
          onClick={() => {
            flashDownloading("ai_tex");
            downloadTextFile("research-dost-draft.tex", aiLatex);
          }}
          disabled={!aiLatex}
        >
          <span className="td-left">
            Download AI LaTeX (.tex)
            {!aiLatex && <span className="td-muted"> (generate IEEE LaTeX first)</span>}
          </span>
          <span className="td-right">
            {downloadingId === "ai_tex" ? <span className="td-spin" /> : <DownloadIcon />}
          </span>
        </button>

        <div className="td-divider" />

        {/* Static downloads */}
        {DOWNLOADS.map((item) => (
          <a
            key={item.id}
            className="td-row td-link"
            href={item.href}
            download
            onClick={() => flashDownloading(item.id)}
          >
            <span className="td-left">{item.label}</span>
            <span className="td-right">
              {downloadingId === item.id ? <span className="td-spin" /> : <DownloadIcon />}
            </span>
          </a>
        ))}

        <div className="td-divider" />

        {/* Official link per selected template */}
        <a
          className="btn-action"
          href={OFFICIAL_LINKS[templateId] || "https://www.overleaf.com/gallery"}
          target="_blank"
          rel="noreferrer"
          style={{ width: "100%", textDecoration: "none" }}
        >
          Open Official Template ↗
        </a>
      </div>

      <p className="td-note">
        Note: The starter .tex files may require the official class/style files (IEEEtran, llncs, acmart, elsarticle) to compile.
      </p>
    </div>
  );
}