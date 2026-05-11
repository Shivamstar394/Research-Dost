import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CATEGORIES = [
  { id: "all", label: "All", icon: "📋" },
  { id: "ai_ml", label: "AI / ML", icon: "🤖" },
  { id: "cs", label: "Computer Science", icon: "💻" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "bfsi", label: "BFSI", icon: "🏦" },
];

const PUBLISHERS = [
  { id: "all", label: "All", icon: "🌍" },
  { id: "ieee", label: "IEEE", icon: "⚡" },
  { id: "springer", label: "Springer", icon: "📗" },
  { id: "acm", label: "ACM", icon: "💻" },
  { id: "other", label: "Other", icon: "🧠" },
];

const DEADLINE_STATUS = {
  open: { label: "Open", className: "dl-open", icon: "🟢" },
  closing_soon: { label: "Closing Soon", className: "dl-closing", icon: "🟡" },
  closed: { label: "Closed", className: "dl-closed", icon: "🔴" },
};

// Fallback data (kept for safety)
const SAMPLE_CONFERENCES = [
  {
    id: "neurips",
    name: "NeurIPS",
    fullName: "Conference on Neural Information Processing Systems",
    category: "ai_ml",
    publisher: "other",
    date: "Varies yearly",
    location: "Varies yearly",
    submissionDeadline: "2026-05-15",
    notificationDate: "2026-09-15",
    submissionLink: "https://neurips.cc/",
    website: "https://neurips.cc/",
    deadlineStatus: "open",
    topics: ["Deep Learning", "Reinforcement Learning"],
    tier: "A*",
  },
];

function detectSubmissionPlatform(url = "") {
  const u = String(url || "").toLowerCase();
  if (u.includes("openreview.net")) return "OpenReview";
  if (u.includes("edas.info")) return "EDAS";
  if (u.includes("cmt") && u.includes("microsoft")) return "CMT";
  return "Official";
}

function safeDateLabel(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ConferenceUpdates() {
  const [conferences, setConferences] = useState(SAMPLE_CONFERENCES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePublisher, setActivePublisher] = useState("all");
  const [showPast, setShowPast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/conferences/live`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        // Read text first (more robust)
        const raw = await res.text();
        let data = {};
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Backend returned invalid JSON for /conferences");
        }

        if (!res.ok) {
          throw new Error(data?.detail || "Failed to fetch conferences");
        }

        if (Array.isArray(data.conferences) && data.conferences.length > 0) {
          setConferences(data.conferences);
        } else {
          // keep fallback if backend returns empty list
          setFetchError("No conferences returned from server (showing sample data).");
          setConferences(SAMPLE_CONFERENCES);
        }
      } catch (e) {
        setFetchError(e.message || "Failed to fetch conferences (showing sample data).");
        setConferences(SAMPLE_CONFERENCES);
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  const filtered = useMemo(() => {
    return (conferences || [])
      .filter((c) => activePublisher === "all" || c.publisher === activePublisher)
      .filter((c) => activeCategory === "all" || c.category === activeCategory)
      .filter((c) => showPast || c.deadlineStatus !== "closed")
      .sort((a, b) => new Date(a.submissionDeadline) - new Date(b.submissionDeadline));
  }, [conferences, activeCategory, activePublisher, showPast]);

  return (
    <div className="cu-section">
      <div className="cu-header">
        <div>
          <h2 className="ws-title">🗓️ Conference Updates</h2>
          <p className="ws-desc">
            Track upcoming conferences across AI/ML, Computer Science, Healthcare, and BFSI.
            Metadata uses official links. Always verify deadlines on the conference website.
          </p>
        </div>

        <div className="cu-live-badge">
          <motion.span
            className="cu-live-dot"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Live Updates
        </div>
      </div>

      {fetchError && (
        <div className="ws-alert ws-alert-warning" style={{ marginBottom: "1rem" }}>
          ⚠️ {fetchError}
        </div>
      )}

{/* Filters */}
<div className="cu-filters">
  {/* Left: category chips */}
  <div className="cu-filters-left">
    <div className="cu-categories">
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          className={`cp-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
          onClick={() => setActiveCategory(cat.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
        >
          <span>{cat.icon}</span> {cat.label}
        </motion.button>
      ))}
    </div>
  </div>

  {/* Right: toggle + India button */}
  <div className="cu-filters-right">
    <label className="toggle-row">
      <span className="toggle-wrap">
        <input
          type="checkbox"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
        />
        <span className="toggle-track" />
      </span>
      <span className="toggle-text">Show past deadlines</span>
    </label>

    <a
      href="https://callforpaper.org/country/india"
      target="_blank"
      rel="noreferrer"
      className="cu-india-cfp-chip"
    >
      Indian CFPs ↗
    </a>
    <a
  href="https://openreview.net/"
  target="_blank"
  rel="noopener noreferrer"
  className="explore-cfp-btn"
>
  Explore More CFPs ↗
</a>
  </div>
</div>

      {/* Loading */}
      {loading && (
        <div className="cp-empty">
          <span style={{ fontSize: "2.2rem" }}>⏳</span>
          <p>Loading conference updates…</p>
        </div>
      )}

      {/* Conference cards */}
      {!loading && (
        <div className="cu-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((conf, idx) => {
              const daysLeft = getDaysUntil(conf.submissionDeadline);
              const dlStatus = DEADLINE_STATUS[conf.deadlineStatus] || DEADLINE_STATUS.open;

              const topics = Array.isArray(conf.topics) ? conf.topics : [];
              const tier = conf.tier || "—";
              const website = conf.website || conf.submissionLink || "#";
              const submissionLink = conf.submissionLink || conf.website || "#";
              const submitVia = detectSubmissionPlatform(submissionLink);

              return (
                <motion.div
                  key={conf.id || idx}
                  className="cu-card"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -4, boxShadow: "var(--shadow-card-hover)" }}
                >
                  {/* Top bar */}
                  <div className="cu-card-top">
                    <span className="cu-card-cat">
                      {CATEGORIES.find((c) => c.id === conf.category)?.icon || "📋"}{" "}
                      {CATEGORIES.find((c) => c.id === conf.category)?.label || "General"}
                    </span>
                    <span className="cu-tier-badge">Tier: {tier}</span>
                  </div>

                  {/* Title */}
                  <h3 className="cu-card-name">{conf.name || "Untitled Conference"}</h3>
                  <p className="cu-card-fullname">{conf.fullName || ""}</p>

                  {/* Details grid */}
                  <div className="cu-details-grid">
                    <div className="cu-detail">
                      <span className="cu-detail-icon">📅</span>
                      <div>
                        <span className="cu-detail-label">Date</span>
                        <span className="cu-detail-val">{conf.date ? conf.date : "TBA"}</span>
                      </div>
                    </div>

                    <div className="cu-detail">
                      <span className="cu-detail-icon">📍</span>
                      <div>
                        <span className="cu-detail-label">Location</span>
                        <span className="cu-detail-val">{conf.location ? conf.location : "TBA"}</span>
                      </div>
                    </div>

                    <div className="cu-detail">
                      <span className="cu-detail-icon">⏰</span>
                      <div>
                        <span className="cu-detail-label">Submission Deadline</span>
                        <span className="cu-detail-val">{safeDateLabel(conf.submissionDeadline)}</span>
                      </div>
                    </div>

                    <div className="cu-detail">
                      <span className="cu-detail-icon">📬</span>
                      <div>
                        <span className="cu-detail-label">Notification</span>
                        <span className="cu-detail-val">{safeDateLabel(conf.notificationDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deadline status */}
                  <div className="cu-deadline-row">
                    <span className={`cu-deadline-badge ${dlStatus.className}`}>
                      {dlStatus.icon} {dlStatus.label}
                    </span>

                    {typeof daysLeft === "number" && daysLeft > 0 && conf.deadlineStatus !== "closed" && (
                      <span className="cu-days-left">
                        {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                      </span>
                    )}
                  </div>

                  {/* Topics + submit platform */}
                  <div className="cu-topics">
                    <span className="cu-topic-chip">Submit via: {submitVia}</span>
                    {topics.map((topic) => (
                      <span key={topic} className="cu-topic-chip">
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="cu-actions">
                    <motion.a
                      href={submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action cu-submit-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Submit Paper →
                    </motion.a>

                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline-action cu-website-btn"
                    >
                      Website ↗
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="cp-empty">
          <span style={{ fontSize: "2.5rem" }}>🗓️</span>
          <p>No conferences match your current filters.</p>
        </div>
      )}
    </div>
  );
}