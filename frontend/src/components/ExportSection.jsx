import React from "react";

export default function ExportSection({ aiLatex, aiMarkdown }) {

  const openOverleaf = () => {
    window.open(
      "https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhncsfqn",
      "_blank"
    );
  };

  const openGoogleDocs = () => {
    window.open("https://docs.google.com/document/u/0/", "_blank");
  };

  const openWordOnline = () => {
    window.open("https://www.office.com/launch/word", "_blank");
  };

return (
  <div className="export-wrapper text-center">

    <h3 className="export-title">
      Draft & Write in External Editor
    </h3>

    <p className="export-subtitle">
      Move your generated draft into a professional editor to finalize formatting,
      references and collaboration.
    </p>

    <div className="export-buttons">
      <button
        className="btn export-btn-gradient"
        onClick={openOverleaf}
      >
        Open in Overleaf (IEEE 2-Column)
      </button>

      <button
        className="btn export-btn-gradient"
        onClick={openGoogleDocs}
      >
        Open in Google Docs
      </button>

      <button
        className="btn export-btn-gradient"
        onClick={openWordOnline}
      >
        Open in Microsoft Word
      </button>
    </div>

    <p className="small text-muted mt-3">
      Copy your generated draft and paste it directly into your preferred editor.
    </p>

  </div>
);
}