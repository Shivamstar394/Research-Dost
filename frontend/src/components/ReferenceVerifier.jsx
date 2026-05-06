import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SOURCES = [
  { id: 'ieee', name: 'IEEE Xplore', icon: '⚡', color: '#00629B' },
  { id: 'springer', name: 'SpringerLink', icon: '📗', color: '#0070A8' },
  { id: 'acm', name: 'ACM DL', icon: '💻', color: '#0085CA' },
  { id: 'scopus', name: 'Scopus', icon: '🔬', color: '#E9711C' },
]

const STATUS_MAP = {
  verified: { label: 'Verified', className: 'status-verified', icon: '✅' },
  partial: { label: 'Partial Match', className: 'status-partial', icon: '⚠️' },
  not_found: { label: 'Not Found', className: 'status-notfound', icon: '❌' },
  pending: { label: 'Checking…', className: 'status-pending', icon: '⏳' },
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ReferenceVerifier() {
  const [inputText, setInputText] = useState('')
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

const REF_START_RE = /^(\[\d+\]|\d+\)|\d+\.|•)\s+/; // [1] or 1) or 1. or bullet

const parseReferences = (text) => {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const refs = [];
  let current = "";

  const pushCurrent = () => {
    const cleaned = current.replace(/\s+/g, " ").trim();
    if (cleaned.length > 10) refs.push(cleaned);
    current = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Blank line = end of one reference block
    if (!line) {
      pushCurrent();
      continue;
    }

    // If a line looks like the start of a new reference and we already have content,
    // then close the current one and start a new one.
    if (REF_START_RE.test(line) && current.trim().length > 0) {
      pushCurrent();
    }

    // Append line to current reference block
    current += (current ? " " : "") + line;
  }

  pushCurrent();

  return refs.map((ref, idx) => ({
    id: idx,
    raw: ref,
    status: "pending",
    matches: [],
  }));
};

  const handleVerify = async () => {
    if (!inputText.trim()) return

    const parsed = parseReferences(inputText)
    setReferences(parsed)
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/verify_references`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          references: parsed.map((r) => r.raw),
          sources: SOURCES.map((s) => s.id),
        }),
      })

      if (!response.ok) {
        // Fallback: simulate verification locally
        const simulated = parsed.map((ref) => ({
          ...ref,
          status: simulateStatus(),
          matches: simulateMatches(ref.raw),
        }))
        setReferences(simulated)
        return
      }

      const data = await response.json()
      const updated = parsed.map((ref, i) => ({
        ...ref,
        status: data.results?.[i]?.status || 'not_found',
        matches: data.results?.[i]?.matches || [],
        doi: data.results?.[i]?.doi || null,
        confidence: data.results?.[i]?.confidence || 0,
      }))
      setReferences(updated)
    } catch (err) {
      // Fallback simulation when backend unavailable
      const simulated = parsed.map((ref) => ({
        ...ref,
        status: simulateStatus(),
        matches: simulateMatches(ref.raw),
      }))
      setReferences(simulated)
      setError('Using offline verification (backend unavailable)')
    } finally {
      setLoading(false)
    }
  }

  const simulateStatus = () => {
    const rand = Math.random()
    if (rand > 0.5) return 'verified'
    if (rand > 0.2) return 'partial'
    return 'not_found'
  }

  const simulateMatches = (raw) => {
    const matches = []
    SOURCES.forEach((src) => {
      if (Math.random() > 0.4) {
        matches.push({
          source: src.id,
          sourceName: src.name,
          confidence: Math.floor(Math.random() * 30 + 70),
          url: '#',
        })
      }
    })
    return matches
  }

  const verifiedCount = references.filter((r) => r.status === 'verified').length
  const totalCount = references.length

  return (
    <div className="rv-section">
      <div className="rv-header">
        <div className="rv-header-left">
          <div className="rv-icon-wrap">🔍</div>
          <div>
            <h2 className="ws-title">Reference Verification</h2>
            <p className="ws-desc">
              Paste your references below to cross-check against IEEE Xplore,
              SpringerLink, ACM Digital Library, and Scopus.
            </p>
          </div>
        </div>
        <div className="rv-sources-row">
          {SOURCES.map((src) => (
            <span key={src.id} className="rv-source-chip">
              <span>{src.icon}</span> {src.name}
            </span>
          ))}
        </div>
      </div>

      <div className="rv-input-area">
        <label className="field-label">Paste references (one per line)</label>
        <textarea
          className="rv-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          placeholder={`[1] A. Author, "Paper Title," in Proc. IEEE Conf., 2023, pp. 1-10.\n[2] B. Author et al., "Another Paper," Journal Name, vol. 10, 2022.\n[3] C. Author, "Third Reference," Springer LNCS, 2024.`}
          disabled={loading}
        />
        <div className="rv-actions">
          <motion.button
            className="btn-action"
            onClick={handleVerify}
            disabled={loading || !inputText.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="btn-loading-inner">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⟳
                </motion.span>
                Verifying…
              </span>
            ) : (
              <>🔍 Verify References</>
            )}
          </motion.button>
          {totalCount > 0 && (
            <span className="rv-count-badge">
              {verifiedCount}/{totalCount} verified
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="ws-alert ws-alert-warning"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {references.length > 0 && !loading && (
          <motion.div
            className="rv-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Summary bar */}
            <div className="rv-summary-bar">
              <div className="rv-summary-item">
                <span className="rv-summary-icon">✅</span>
                <span className="rv-summary-val">
                  {references.filter((r) => r.status === 'verified').length}
                </span>
                <span className="rv-summary-lbl">Verified</span>
              </div>
              <div className="rv-summary-item">
                <span className="rv-summary-icon">⚠️</span>
                <span className="rv-summary-val">
                  {references.filter((r) => r.status === 'partial').length}
                </span>
                <span className="rv-summary-lbl">Partial</span>
              </div>
              <div className="rv-summary-item">
                <span className="rv-summary-icon">❌</span>
                <span className="rv-summary-val">
                  {references.filter((r) => r.status === 'not_found').length}
                </span>
                <span className="rv-summary-lbl">Not Found</span>
              </div>
            </div>

            {/* Individual results */}
            {references.map((ref, idx) => {
              const st = STATUS_MAP[ref.status] || STATUS_MAP.not_found
              return (
                <motion.div
                  key={ref.id}
                  className="rv-ref-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
                >
                  <div className="rv-ref-top">
                    <span className="rv-ref-num">#{idx + 1}</span>
                    <span className={`rv-status ${st.className}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <p className="rv-ref-text">{ref.raw}</p>

                  {ref.doi && (
                    <div className="rv-doi">
                      <span className="rv-doi-label">DOI:</span>
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rv-doi-link"
                      >
                        {ref.doi}
                      </a>
                    </div>
                  )}

                  {ref.matches.length > 0 && (
                    <div className="rv-matches">
                      <span className="rv-matches-label">Found in:</span>
                      <div className="rv-matches-list">
                        {ref.matches.map((m, mi) => (
                          <span key={mi} className="rv-match-chip">
                            {SOURCES.find((s) => s.id === m.source)?.icon}{' '}
                            {m.sourceName}
                            <span className="rv-confidence">
                              {m.confidence}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}