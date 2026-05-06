import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TEMPLATE_OPTIONS = [
  { id: "ieee", name: "IEEE Conference Paper" },
  { id: "springer", name: "Springer / LNCS Article" },
  { id: "acm", name: "ACM Article" },
  { id: "elsevier", name: "Elsevier Journal" },
  { id: "imrad", name: "Generic IMRaD" },
];

export default function GenerateWithAI({ query, templateId }) {
  const [loadingPlatform, setLoadingPlatform] = useState("");
  const [error, setError] = useState("");

  // popup states
  const [popupStep, setPopupStep] = useState(0);
  const [activePlatform, setActivePlatform] = useState("");
  const [selectedStructure, setSelectedStructure] = useState(templateId || "ieee");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const platformNames = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
  };

  const urls = {
    chatgpt: "https://chat.openai.com/",
    claude: "https://claude.ai/",
    gemini: "https://gemini.google.com/",
  };

  const closePopup = () => {
    setPopupStep(0);
    setIsGeneratingPrompt(false);
  };

  // Step 1: user clicks AI platform button
  const startGenerate = (platform) => {
    setError("");
    setActivePlatform(platform);
    setSelectedStructure(templateId || "ieee");
    setPopupStep(1);
  };

  // Step 2: generate prompt after structure selected
  const handleStructureContinue = async () => {
    setError("");

    if (!query || !query.trim()) {
      setError("Please run a research search first.");
      setPopupStep(0);
      return;
    }

    try {
      setLoadingPlatform(activePlatform);
      setIsGeneratingPrompt(true);

      const res = await fetch(`${API_BASE}/generate_prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          query: query,
          template_id: selectedStructure,
          sources: [],
        }),
      });

      const rawText = await res.text();

      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Backend returned invalid response format");
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to generate prompt");
      }

      if (!data.prompt) {
        throw new Error("Prompt is empty");
      }

      await navigator.clipboard.writeText(data.prompt);

      setIsGeneratingPrompt(false);
      setPopupStep(2);
    } catch (err) {
      console.error("Generate prompt error:", err);
      setError(err.message || "Error generating prompt.");
      setIsGeneratingPrompt(false);
      setPopupStep(0);
    } finally {
      setLoadingPlatform("");
    }
  };

  // Step 3
  const handleCopiedOk = () => {
    setPopupStep(3);
  };

  // Step 4
  const handleFinalOpen = () => {
    const newTab = window.open(urls[activePlatform], "_blank");
    if (!newTab) {
      alert("Popup blocked by browser. Please allow popups for this site.");
    }
    setPopupStep(0);
  };

  return (
    <>
      <div className="generate-ai-wrapper text-center">
        <div className="ai-header">
          <h3 className="ai-title">Generate Paper Using AI</h3>
          <p className="ai-subtitle">
            Instantly generate a structured academic draft using your preferred AI model.
          </p>
        </div>

        {error && (
          <div className="ws-alert ws-alert-error mb-3">
            ⚠️ {error}
          </div>
        )}

        <div className="ai-buttons-container">
          <button
            type="button"
            className={`ai-btn ai-chatgpt ${loadingPlatform === "chatgpt" ? "loading" : ""}`}
            onClick={() => startGenerate("chatgpt")}
            disabled={!!loadingPlatform}
          >
            {loadingPlatform === "chatgpt" ? "Generating..." : "ChatGPT"}
          </button>

          <button
            type="button"
            className={`ai-btn ai-claude ${loadingPlatform === "claude" ? "loading" : ""}`}
            onClick={() => startGenerate("claude")}
            disabled={!!loadingPlatform}
          >
            {loadingPlatform === "claude" ? "Generating..." : "Claude"}
          </button>

          <button
            type="button"
            className={`ai-btn ai-gemini ${loadingPlatform === "gemini" ? "loading" : ""}`}
            onClick={() => startGenerate("gemini")}
            disabled={!!loadingPlatform}
          >
            {loadingPlatform === "gemini" ? "Generating..." : "Gemini"}
          </button>
        </div>

        <div className="ai-footer">
          Prompt is automatically copied. Paste it into the AI chat.
          Don&apos;t forget to humanize and fact-check the generated content.
        </div>
      </div>

      {/* Step 1: Structure selection popup */}
      {popupStep === 1 && !isGeneratingPrompt && (
        <div className="ai-popup-overlay">
          <div className="ai-popup-card">
            <button className="ai-popup-close" onClick={closePopup}>
              ×
            </button>

            <div className="ai-popup-icon">📄</div>
            <h4 className="ai-popup-title">Choose Paper Structure</h4>
            <p className="ai-popup-text">
              Select the paper format you want before generating the prompt for{" "}
              <strong>{platformNames[activePlatform]}</strong>.
            </p>

            <div className="ai-structure-options">
              {TEMPLATE_OPTIONS.map((tpl) => (
                <label
                  key={tpl.id}
                  className={`ai-structure-option ${
                    selectedStructure === tpl.id ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paperStructure"
                    value={tpl.id}
                    checked={selectedStructure === tpl.id}
                    onChange={() => setSelectedStructure(tpl.id)}
                  />
                  <span>{tpl.name}</span>
                </label>
              ))}
            </div>

            <button className="ai-popup-btn" onClick={handleStructureContinue}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Loading Popup */}
      {isGeneratingPrompt && (
        <div className="ai-popup-overlay">
          <div className="ai-popup-card ai-loading-card">
            <button className="ai-popup-close" onClick={closePopup}>
              ×
            </button>

            <div className="ai-loader-wrap">
              <div className="ai-loader-spinner"></div>
            </div>
            <h4 className="ai-popup-title">Generating Prompt...</h4>
            <p className="ai-popup-text">
              Please wait while we prepare your structured academic prompt.
            </p>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {popupStep === 2 && !isGeneratingPrompt && (
        <div className="ai-popup-overlay">
          <div className="ai-popup-card">
            <button className="ai-popup-close" onClick={closePopup}>
              ×
            </button>

            <div className="ai-popup-icon">✅</div>
            <h4 className="ai-popup-title">Prompt Copied!</h4>
            <p className="ai-popup-text">
              Your prompt has been generated using the{" "}
              <strong>
                {TEMPLATE_OPTIONS.find((t) => t.id === selectedStructure)?.name}
              </strong>{" "}
              structure and copied automatically.
              <br />
              Just paste it into <strong>{platformNames[activePlatform]}</strong>.
            </p>
            <button className="ai-popup-btn" onClick={handleCopiedOk}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {popupStep === 3 && !isGeneratingPrompt && (
        <div className="ai-popup-overlay">
          <div className="ai-popup-card">
            <button className="ai-popup-close" onClick={closePopup}>
              ×
            </button>

            <div className="ai-popup-icon">✨</div>
            <h4 className="ai-popup-title">Important Reminder</h4>
            <p className="ai-popup-text">
              After generating the draft, don&apos;t forget to use the{" "}
              <strong>Refine</strong> and <strong>Humanize your AI draft</strong>{" "}
              section available in the platform.
            </p>
            <button className="ai-popup-btn" onClick={handleFinalOpen}>
              Open {platformNames[activePlatform]} & Paste
            </button>
          </div>
        </div>
      )}
    </>
  );
}