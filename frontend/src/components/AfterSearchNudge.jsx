import React from "react";

export default function AfterSearchNudge({ open, onClose, onGoNotes, onGoTemplates }) {
  if (!open) return null;

  return (
    <div className="ai-popup-overlay">
      <div className="ai-popup-card">
        <button className="ai-popup-close" onClick={onClose}>×</button>

        <div className="ai-popup-icon">🚀</div>
        <h4 className="ai-popup-title">Next Step</h4>
        <p className="ai-popup-text">
          Papers are ready. Don’t forget to generate a full paper draft using AI and then{" "}
          <strong>refine + humanize</strong> the output inside Research Dost.
        </p>

        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-action" onClick={onGoNotes}>
            Go to Notes → Generate with AI
          </button>
          <button className="btn-outline-action" onClick={onGoTemplates}>
            Open Paper Templates
          </button>
        </div>
      </div>
    </div>
  );
}