import React from "react";

const CONTENT = {
  about: {
    title: "About Research Dost",
    body: (
      <>
        <p>
          Research Dost is an AI-powered research workspace that helps you search papers,
          generate structured notes, draft sections in popular templates, and export to LaTeX/Markdown.
        </p>
        <p>
          Use it for literature review, summarization, structured writing, and clean exports.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <p>
          We store your account email and may store your search queries to improve usability (query history).
          We do not sell user data.
        </p>
        <p>
          Always avoid submitting sensitive personal data into prompts.
        </p>
      </>
    ),
  },
  terms: {
    title: "Terms",
    body: (
      <>
        <p>
          Research Dost is an assistant tool. Outputs may contain errors—always verify citations and facts.
        </p>
        <p>
          By using the platform, you agree to use it responsibly and comply with publisher rules.
        </p>
      </>
    ),
  },
};

export default function FooterModal({ openKey, onClose }) {
  if (!openKey) return null;

  const item = CONTENT[openKey];
  if (!item) return null;

  return (
    <div className="ai-popup-overlay">
      <div className="ai-popup-card footer-modal-card">
        <button className="ai-popup-close" onClick={onClose}>×</button>

        <div className="ai-popup-icon">📄</div>
        <h4 className="ai-popup-title">{item.title}</h4>

        <div className="footer-modal-body">
          {item.body}
        </div>

        <button className="ai-popup-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}