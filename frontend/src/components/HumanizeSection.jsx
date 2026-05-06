import React from "react";

export default function HumanizeSection() {
  const handleRedirect = () => {
    window.open("https://aihumanize.io/", "_blank");
  };

  return (
    <div className="humanize-wrapper text-center">
      <div className="humanize-content">
        <h3 className="humanize-title">Refine & Humanize Your AI Draft</h3>
        <p className="humanize-subtitle">
          Improve readability, remove AI-style patterns, and make your academic
          writing sound more natural and human-authored.
        </p>

        <button
          type="button"
          className="humanize-btn"
          onClick={handleRedirect}
        >
          Humanize the Text →
        </button>
      </div>
    </div>
  );
}