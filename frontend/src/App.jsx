import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import './App.css'
import HumanizeSection from './components/HumanizeSection'
import GenerateWithAI from "./components/GenerateWithAI"
import ExportSection from "./components/ExportSection"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Login from "./auth/Login"
import Signup from "./auth/Signup"
import ProtectedRoute from "./auth/ProtectedRoute"
import ForgotPassword from "./auth/ForgotPassword"
import VerifyOTP from "./auth/VerifyOTP"
// Add these imports at the top of App.jsx
import ReferenceVerifier from './components/ReferenceVerifier'
import PaperTemplateGallery from './components/PaperTemplateGallery'
import ConferencePapers from './components/ConferencePapers'
import ConferenceUpdates from './components/ConferenceUpdates'
import DashboardTour from "./components/DashboardTour"
import AfterSearchNudge from "./components/AfterSearchNudge"
import TemplateDownloads from "./components/TemplateDownloads"
import GetInTouch from "./components/GetInTouch";
import FooterModal from "./components/FooterModal";
import './features.css'
import BrandWordmark from "./components/BrandWordmark";
// ──────────────── Decorative Floating Shapes ────────────────

function FloatingShapes() {
  return (
    <div className="floating-shapes" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`shape shape-${i + 1}`}
          animate={{
            x: [0, 20 + i * 5, -15, 10, 0],
            y: [0, -25 - i * 4, 15, -8, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ──────────────── Animated Counter ────────────────

function AnimatedCounter({ value, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || value == null || value === '—') return
    const num = parseInt(value)
    if (isNaN(num)) return
    let start = 0
    const inc = num / (duration * 60)
    const timer = setInterval(() => {
      start += inc
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, value, duration])

  return <span ref={ref}>{value == null || value === '—' ? '—' : count}</span>
}

// ──────────────── Reveal on Scroll ────────────────

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ──────────────── Scroll Progress ────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  return <motion.div className="scroll-progress-bar" style={{ scaleX, transformOrigin: '0%' }} />
}

// ──────────────── Back to Top ────────────────

function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', toggle)
    return () => window.removeEventListener('scroll', toggle)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="back-to-top-btn"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ──────────────── Constants ────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const PAPER_TEMPLATES = [
  { id: 'ieee', name: 'IEEE Conference', badge: 'Popular', icon: '📄', sections: ['Abstract','Keywords','I. Introduction','II. Related Work','III. Methodology','IV. Experiments and Results','V. Conclusion and Future Work','References'] },
  { id: 'springer', name: 'Springer / LNCS', badge: 'Workshops', icon: '📚', sections: ['Abstract','Keywords','1 Introduction','2 Background and Related Work','3 Method','4 Results','5 Discussion','6 Conclusion','References'] },
  { id: 'acm', name: 'ACM Article', badge: 'CS', icon: '💻', sections: ['Abstract','Keywords','1 Introduction','2 Background','3 Methods','4 Results','5 Discussion','6 Conclusion and Future Work','References'] },
  { id: 'elsevier', name: 'Elsevier Journal', badge: 'Journals', icon: '🔬', sections: ['Abstract','Keywords','1 Introduction','2 Materials and Methods','3 Results','4 Discussion','5 Conclusion','References'] },
  { id: 'imrad', name: 'Generic IMRaD', badge: 'Flexible', icon: '📝', sections: ['Abstract','Keywords','Introduction','Methods','Results','Discussion','Conclusion','References'] },
]

// ──────────────── Hero ────────────────

function Hero({ results }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -60])

  return (
    <section className="hero">
      <div className="row align-items-center gy-5">
        <motion.div className="col-lg-6" style={{ y: y1 }}>
          <RevealSection>
            <motion.span
              className="hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
            >
              <span className="hero-badge-dot" />
              Autonomous AI Research Agent
            </motion.span>
          </RevealSection>

          <RevealSection delay={0.08}>
            <h1 className="hero-heading">
              Search, understand, and{' '}
              <span className="text-gradient">draft research</span>{' '}
              papers in one workspace.
            </h1>
          </RevealSection>

          <RevealSection delay={0.16}>
            <p className="hero-desc">
              Describe your research question in plain language. Research Dost searches
              academic sources, summarises relevant papers, and helps you turn insights
              into well-structured notes and paper drafts.
            </p>
          </RevealSection>

          <RevealSection delay={0.24}>
            <div className="hero-features-list">
              {[
                { icon: '🔍', text: 'Multi-source search — ArXiv, PubMed, Springer & more' },
                { icon: '🤖', text: 'AI answers with citations and structured notes' },
                { icon: '📄', text: 'IEEE, Springer, ACM, Elsevier & IMRaD templates' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="hero-feature"
                  whileHover={{ x: 6 }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                >
                  <span className="hero-feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={0.32}>
            <div className="hero-tags-row">
              {['Lit-review assistant', 'RAG + LLM agents', 'For students & researchers'].map((t, i) => (
                <motion.span
                  key={t}
                  className="hero-tag-chip"
                  whileHover={{ scale: 1.06, y: -2 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </RevealSection>
        </motion.div>

        {/* Right column — illustration + metrics */}
        <motion.div
          className="col-lg-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="hero-right">
            {/* ★ ILLUSTRATION SLOT — swap the placeholder for your image */}
            <div className="illustration-card">
            
              { <img src="/research-assistant.svg" alt="AI-powered robot" /> }

              
            </div>

            <div className="metrics-card">
              <span className="metrics-card-label">Snapshot from your last run</span>
              <div className="metrics-row">
                {[
                  { val: results?.papers_found, label: 'Papers' },
                  { val: results?.sources_used ? results.sources_used.length : 2, label: 'Sources' },
                  { val: results?.paper_summaries ? results.paper_summaries.length : 0, label: 'Summarised' },
                ].map((m, i) => (
                  <div className="metric-cell" key={i}>
                    <div className="metric-val"><AnimatedCounter value={m.val} /></div>
                    <div className="metric-lbl">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="metric-tip">
                💡 Start with a broad query like <code>"deep RL for healthcare"</code>, then refine.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
function AnswerWithNumbering({ text }) {
  if (!text) return null;

  const lines = String(text).split("\n");

  // Find lines that start a new paper block
  const titleIdx = [];
  lines.forEach((l, i) => {
    if (l.trim().startsWith("Title:")) titleIdx.push(i);
  });

  // If we don't detect multiple title blocks, fallback to normal rendering
  if (titleIdx.length < 1) {
    return <p className="answer-body">{text}</p>;
  }

  const introLines = lines.slice(0, titleIdx[0]).join("\n").trim();
  const items = titleIdx.map((start, k) => {
    const end = k + 1 < titleIdx.length ? titleIdx[k + 1] : lines.length;
    return lines.slice(start, end);
  });

  const renderLine = (line, key) => {
    const t = line.trim();
    if (!t) return <div key={key} className="answer-line answer-blank" />;

    if (t.startsWith("Title:")) {
      return (
        <div key={key} className="answer-line">
          <strong>Title:</strong> {t.replace(/^Title:\s*/i, "")}
        </div>
      );
    }

    if (t.startsWith("Summary:")) {
      return (
        <div key={key} className="answer-line">
          <strong>Summary:</strong> {t.replace(/^Summary:\s*/i, "")}
        </div>
      );
    }

    return (
      <div key={key} className="answer-line">
        {line}
      </div>
    );
  };

  return (
    <div>
      {introLines && <p className="answer-intro">{introLines}</p>}

      <div className="answer-numbered">
        {items.map((blockLines, idx) => (
          <div key={idx} className="answer-item">
            <div className="answer-item-num">{idx + 1})</div>
            <div className="answer-item-body">
              {blockLines.map((l, j) => renderLine(l, j))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ──────────────── Research View ────────────────

function ResearchView({
  results, loading, error, query, setQuery,queryHistory, setQueryHistory,
  activeTab, setActiveTab, handleSearch,
  selectedTemplateId, setSelectedTemplateId,
}) {
    const QUERY_EXAMPLES = [
    "Recent advances in quantum computing error correction",
    "Transformer models for medical diagnosis with explainability",
    "RAG systems for legal document analysis",
    "Federated learning for healthcare privacy",
    "Graph neural networks for fraud detection in BFSI",
    "Diffusion models for image generation (survey 2023–2026)",
  ];

  const [showSug, setShowSug] = useState(false);

  const merged = Array.from(new Set([...(queryHistory || []), ...QUERY_EXAMPLES]));

  const suggestions = merged
    .filter((s) => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return false;
      return s.toLowerCase().includes(q) && s.toLowerCase() !== q;
    })
    .slice(0, 7);
  return (
    <>
      {/* Search */}
      <RevealSection>
        <div className="workspace-card">
          <div className="workspace-header">
            <motion.span
              className="workspace-icon"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              🌐
            </motion.span>
            <div>
              <h2 className="ws-title">Research workspace</h2>
              <p className="ws-desc">
                Enter a natural-language research question. The agent searches academic sources,
                reads papers, and returns an answer, notes and summaries.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="ws-form">
            <div className="ws-form-grid">
              <div className="ws-field ws-field-main">
                <label className="field-label">Research query</label>
                <div className="field-input-wrap query-suggest-wrap">
  <span className="field-icon">🔍</span>

  <input
    type="text"
    className="field-input"
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      setShowSug(true);
    }}
    onFocus={() => setShowSug(true)}
    onBlur={() => setTimeout(() => setShowSug(false), 150)}
    disabled={loading}
    placeholder="e.g. Recent advances in reinforcement learning for robotic navigation"
    autoComplete="off"
  />

  {showSug && suggestions.length > 0 && (
    <div className="query-suggest-dropdown">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          className="query-suggest-item"
          onMouseDown={(e) => e.preventDefault()}  // prevents blur before click
          onClick={() => {
            setQuery(s);
            setShowSug(false);
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )}
</div>
              </div>

              <div className="ws-field ws-field-tpl">
                <label className="field-label">Notes template</label>
                <select
                  className="field-select"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={loading}
                >
                  {PAPER_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                  ))}
                </select>
              </div>

              <div className="ws-field ws-field-btn">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="btn-action"
                >
                  {loading ? (
                    <span className="btn-loading-inner">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
                      Searching…
                    </span>
                  ) : (
                    <>Search papers <span className="btn-arr">→</span></>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </RevealSection>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="ws-alert ws-alert-error"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            ⚠️ <strong>Error:</strong> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div className="ws-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="loading-inner">
              <div className="loading-spinner-group">
                <motion.div className="spinner-ring r1" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="spinner-ring r2" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                <span className="spinner-center-icon">🔬</span>
              </div>
              <h3 className="loading-title">Searching academic databases…</h3>
              <p className="loading-sub">Analysing papers across multiple sources</p>
              <div className="progress-track">
                <motion.div className="progress-fill" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 30, ease: 'linear' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Summary strip */}
            <RevealSection>
              <div className="results-strip">
                {[
                  { icon: '📚', value: results.papers_found, label: 'Papers found' },
                  { icon: '🔗', value: results.sources_used?.length || 0, label: results.sources_used?.join(', ') || 'Sources' },
                  { icon: '🤖', value: 'AI', label: 'Answer • Notes • Summaries' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    className="strip-cell"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: 'spring' }}
                  >
                    <span className="strip-icon">{s.icon}</span>
                    <span className="strip-val">{s.value}</span>
                    <span className="strip-lbl">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </RevealSection>

            {/* Tabs */}
            <RevealSection delay={0.08}>
              <div className="tabs-bar">
                {[
                  { id: 'answer', label: 'Answer', icon: '💬' },
                  { id: 'notes', label: 'Notes', icon: '📝' },
                  { id: 'papers', label: `Summaries (${results.paper_summaries?.length || 0})`, icon: '📄' },
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                    {activeTab === tab.id && (
                      <motion.div className="tab-underline" layoutId="tabLine" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    )}
                  </motion.button>
                ))}
              </div>
            </RevealSection>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'answer' && (
                <motion.div key="answer" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div className="content-card">
                    <h3 className="cc-heading">💬 Latest Study</h3>
                    <AnswerWithNumbering text={results.answer} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div key="notes" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div className="content-card mb-4">
                    <div className="cc-heading-row">
                      <h3 className="cc-heading">📝 Research notes</h3>
                      <span className="tpl-badge">{selectedTemplateId.toUpperCase()}</span>
                    </div>
                    <pre className="notes-body">{results.research_notes}</pre>
                  </div>
                  <div className="content-card">
                    <GenerateWithAI query={query} templateId={selectedTemplateId} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'papers' && (
                <motion.div key="papers" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div className="papers-list">
                    {results.paper_summaries?.map((paper, idx) => (
                      <motion.div
                        key={paper.url || paper.title || idx}
                        className="paper-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
                      >
                        <span className="paper-num">#{idx + 1}</span>
                        <h4 className="paper-ttl">{paper.title}</h4>
                        <span className="paper-src">{paper.source}</span>
                        <p className="paper-auth">
                          👤 {paper.authors.slice(0, 3).join(', ')}
                          {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
                        </p>
                        <p className="paper-sum">{paper.summary}</p>
                        <motion.a href={paper.url} target="_blank" rel="noreferrer" className="paper-link" whileHover={{ x: 4 }}>
                          Read full paper <span>→</span>
                        </motion.a>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty */}
      {!results && !loading && !error && (
        <RevealSection>
          <div className="empty-block">
            <div className="empty-illus-slot">
              { <img src="/ready-to-start.svg" alt="" /> }
              
            </div>
            <h3>Ready to start your literature review?</h3>
            <p>Enter a research question above, then switch to <strong>Paper templates</strong> to draft.</p>
          </div>
        </RevealSection>
      )}
    </>
  )
}

// ──────────────── Templates View ────────────────

function TemplatesView({ results, selectedTemplateId, setSelectedTemplateId, lastQuery }) {
  const [paperTitle, setPaperTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [includeNotes, setIncludeNotes] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState('')
  const [aiMarkdown, setAiMarkdown] = useState('')
  const [aiLatex, setAiLatex] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const tpl = PAPER_TEMPLATES.find(t => t.id === selectedTemplateId)
  const canDraft = Boolean(lastQuery?.trim())

  const handleGenerate = () => {
    if (!tpl) return
    let out = `# ${paperTitle.trim() || 'Untitled Paper'}\n\n`
    if (authors.trim()) out += `**Authors:** ${authors.trim()}\n\n`
    tpl.sections.forEach(s => {
      out += `## ${s}\n\n[Content here]\n\n`
      if (includeNotes && results?.research_notes) {
        out += results.research_notes.split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
      }
    })
    setGeneratedTemplate(out)
  }

  const handleAI = async () => {
    if (!tpl || !canDraft) { setAiError('Run a research query first.'); return }
    setAiLoading(true); setAiError(''); setAiMarkdown(''); setAiLatex('')
    try {
      const res = await fetch(`${API_BASE}/draft_sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: lastQuery.trim(), template_id: selectedTemplateId, sections: tpl.sections, top_papers: 8 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed')
      setAiMarkdown(data.markdown || ''); setAiLatex(data.latex_ieee || '')
    } catch (e) { setAiError(e.message) }
    finally { setAiLoading(false) }
  }

  return (
    <RevealSection className="mt-4">
      <div className="tpl-header-row">
        <div>
          <h2 className="ws-title">📋 Paper templates</h2>
          <p className="ws-desc">Choose a format and generate an outline or AI-written sections.</p>
        </div>
        <div className="tpl-illus-slot">
          <iframe src="https://lottie.host/embed/3f3c5433-773f-456d-b670-7c477b4effed/m542Iek70i.lottie"></iframe>
          
        </div>
      </div>
      
      <div className="row gy-4">
        {/* Left */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <label className="field-label">Select template</label>
            <div className="chip-group">
              {PAPER_TEMPLATES.map((t, i) => (
                <motion.button
                  key={t.id}
                  className={`tpl-chip ${selectedTemplateId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplateId(t.id)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span>{t.icon}</span> {t.name} <span className="chip-badge">{t.badge}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-3">
              <label className="field-label">Paper title</label>
              <input className="field-input" value={paperTitle} onChange={e => setPaperTitle(e.target.value)} placeholder="Your paper title…" />
            </div>
            <div className="mt-3">
              <label className="field-label">Authors</label>
              <input className="field-input" value={authors} onChange={e => setAuthors(e.target.value)} placeholder="Author names…" />
            </div>

            <label className="toggle-row mt-3">
              <span className="toggle-wrap">
                <input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} disabled={!results?.research_notes} />
                <span className="toggle-track" />
              </span>
              <span className="toggle-text">Attach AI research notes</span>
            </label>

            <div className="btn-stack mt-4">
              <motion.button className="btn-outline-action" onClick={handleGenerate} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                📝 Generate Markdown outline
              </motion.button>
              <button className="btn-action" onClick={handleAI} disabled={aiLoading || !canDraft}>
                {aiLoading ? '⟳ Generating…' : '🤖 Auto-generate AI sections'}
              </button>
            </div>

            {aiError && <div className="ws-alert ws-alert-error mt-3">{aiError}</div>}
          </div>
        </div>

        {/* Right */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <div className="preview-bar">
              <span className="dot green" /><span className="dot yellow" /><span className="dot red" />
              <span className="preview-label">Preview</span>
            </div>
            <pre className="code-block">{generatedTemplate || 'Your draft will appear here…'}</pre>

            <AnimatePresence>
              {aiMarkdown && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <hr />
                  <h4 className="cc-heading">AI Generated Markdown</h4>
                  <pre className="code-block">{aiMarkdown}</pre>
                </motion.div>
              )}
              {selectedTemplateId === 'ieee' && aiLatex && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <hr />
                  <h4 className="cc-heading">IEEE LaTeX</h4>
                  <pre className="code-block latex">{aiLatex}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <RevealSection delay={0.15} className="mt-5">
        <ExportSection aiLatex={aiLatex} aiMarkdown={aiMarkdown} />
      </RevealSection>

      {/* ✅ NEW: Template downloads panel */}
      <TemplateDownloads
        templateId={selectedTemplateId}
        aiLatex={aiLatex}
        aiMarkdown={aiMarkdown}
      />
    </RevealSection>
  )
}

// ──────────────── How It Works ────────────────

const STEPS = [
  { title: 'Ask a question', body: 'Describe your topic in plain language.', icon: '❓', color: 'indigo' },
  { title: 'Search sources', body: 'ArXiv, PubMed, Springer and more are queried.', icon: '🔍', color: 'blue' },
  { title: 'Get summaries', body: 'Per-paper summaries and synthesised notes.', icon: '📊', color: 'emerald' },
  { title: 'Draft your paper', body: 'Turn notes into IEEE, ACM or journal drafts.', icon: '✍️', color: 'rose' },
]

function HowItWorks() {
  return (
    <RevealSection className="how-section">
      <div className="how-head">
        <h2 className="ws-title">⚡ How Research Dost works</h2>
        <p className="ws-desc">From question → papers → understanding → draft.</p>
      </div>

      {/* ★ ILLUSTRATION SLOT for workflow diagram */}
      <div className="how-illus-slot">
        { <img src="/searching-guy.svg" alt="Workflow" /> }
        
      </div>

      <div className="steps-grid">
        {STEPS.map((s, i) => (
          <RevealSection key={s.title} delay={i * 0.1}>
            <motion.div className="step-card" whileHover={{ y: -8 }}>
              <motion.div className={`step-icon bg-${s.color}`} whileHover={{ rotate: 10, scale: 1.15 }}>
                {s.icon}
              </motion.div>
              <span className="step-num">0{i + 1}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </motion.div>
          </RevealSection>
        ))}
      </div>
    </RevealSection>
  )
}

// ──────────────── Updated Dashboard Component ────────────────

function SmileO() {
  return (
    <span className="smile-o" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path d="M8.5 14c1.1 1.6 2.4 2.4 3.5 2.4S14.4 15.6 15.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

function AnimatedBrandName() {
  const dirs = [
    { x: 0, y: -18 },  // top
    { x: -18, y: 0 },  // left
    { x: 18, y: 0 },   // right
    { x: 0, y: 18 },   // bottom
  ];

  const letters = [
    ...("Research ".split("")),
    ..."D".split(""),
    { smile: true },
    ..."st".split(""),
  ];

  return (
    <motion.span
      className="brand-animated"
      initial="hidden"
      animate="show"
    >
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          className="brand-letter"
          custom={i}
          variants={{
            hidden: (idx) => ({
              opacity: 0,
              x: dirs[idx % 4].x,
              y: dirs[idx % 4].y,
              filter: "blur(8px)",
            }),
            show: (idx) => ({
              opacity: 1,
              x: 0,
              y: 0,
              filter: "blur(0px)",
              transition: { delay: idx * 0.03, type: "spring", stiffness: 450, damping: 28 },
            }),
          }}
        >
          {typeof ch === "object" && ch.smile ? <SmileO /> : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}
function Dashboard() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [queryHistory, setQueryHistory] = useState([])
  const [activeTab, setActiveTab] = useState('answer')
  // ★ Updated: More views
  const [activeView, setActiveView] = useState('research')
  const [selectedTemplateId, setSelectedTemplateId] = useState('ieee')
  const [showMenu, setShowMenu] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  // ✅ NEW: Tour + After-search nudge
  const [showTourHint, setShowTourHint] = useState(false);
  const [runTour, setRunTour] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const tourInitRef = useRef(false);
  const [footerModal, setFooterModal] = useState(null);
useEffect(() => {
  const done = localStorage.getItem("rd_tour_done");
  if (done) return;

  const t = setTimeout(() => setShowTourHint(true), 800);
  return () => clearTimeout(t);
}, []);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
useEffect(() => {
  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`${API_BASE}/query_history?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()

      const queries = (data.history || [])
        .map((x) => x.query)
        .filter(Boolean)

      setQueryHistory(queries)
    } catch {
      // ignore
    }
  }

  loadHistory()
}, [])
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(null); setResults(null)
    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query,
          sources: ['arxiv','pubmed','crossref','doaj','ssrn','springer','ieee_xplore','semantic_scholar'],
          template_id: selectedTemplateId,
        }),
      })
      if (res.status === 401) { localStorage.removeItem('token'); navigate('/login', { replace: true }); return }
      const data = await res.json()
      if (data.status === 'success') { setResults(data); setActiveTab('answer'); setShowNudge(true) }
      else setError(data.message || 'No results')
    } catch (err) { setError('Connection failed: ' + err.message) }
    finally { setLoading(false) }
  }

  // ★ All available views
  const VIEWS = [
    { id: 'research',    label: '🔬 Research' },
    { id: 'templates',   label: '📋 Templates' },
    { id: 'gallery',     label: '📄 Gallery' },
    { id: 'verify',      label: '🔍 Verify' },
    { id: 'papers',      label: '📚 Papers' },
    { id: 'conferences', label: '🗓️ Conferences' },
  ]

  return (
    <div className="app-root">
      <FloatingShapes />
      <ScrollProgress />
      <BackToTop />
      <FooterModal openKey={footerModal} onClose={() => setFooterModal(null)} />
    {/* ✅ Guided Tour */}
      <DashboardTour run={runTour} setRun={setRunTour} />

      {/* ✅ After-search popup */}
      <AfterSearchNudge
        open={showNudge}
        onClose={() => setShowNudge(false)}
        onGoNotes={() => {
          setShowNudge(false)
          setActiveView("research")
          setActiveTab("notes")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        onGoTemplates={() => {
          setShowNudge(false)
          setActiveView("templates")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
      />
      {/* ──── Navbar ──── */}
      <motion.nav
        className="top-nav"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="container">
          <div className="nav-inner">
            {/* Brand */}
            <a href="#" className="nav-brand">
              <motion.div className="brand-logo logo-avatar logo-sm" whileHover={{ rotate: 6, scale: 1.05 }}>
  <img src="/research-dost-logo.png" alt="Research Dost" />
</motion.div>
              <div>
                <div className="brand-name">
  <BrandWordmark animate />
</div>
                <div className="brand-sub">AI-powered research assistant</div>
              </div>
            </a>

            {/* ★ Updated: scrollable nav center */}
            <div className="nav-center d-none d-md-flex">
              <div className="view-switcher view-switcher-scroll">
                {VIEWS.map((v) => (
                  <motion.button
                    key={v.id}
                    className={`vs-btn ${activeView === v.id ? 'active' : ''}`}
                    onClick={() => setActiveView(v.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {v.label}
                    {activeView === v.id && (
                      <motion.div
                        className="vs-indicator"
                        layoutId="vsInd"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="nav-right">
              {results && (
                <motion.div className="nav-counter" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <span className="nc-val">{results.papers_found}</span>
                  <span className="nc-lbl">papers</span>
                </motion.div>
              )}
              <div className="tour-btn-wrap">
  <button
    className="tour-btn"
    type="button"
    onClick={() => {
      setShowTourHint(false);
      localStorage.setItem("rd_tour_hint_seen", "1");
      setRunTour(true); // ✅ starts your DashboardTour
    }}
  >
    Take a tour
  </button>

  {showTourHint && (
    <div className="tour-hint" role="dialog" aria-label="Tour hint">
      <button
        className="tour-hint-close"
        type="button"
        onClick={() => {
          setShowTourHint(false);
          localStorage.setItem("rd_tour_hint_seen", "1");
        }}
        aria-label="Close"
      >
        ×
      </button>
      <div className="tour-hint-title">New here?</div>
      <div className="tour-hint-body">Click “Take a tour” to see how the page works.</div>
    </div>
  )}
</div>
              <div className="profile-area" ref={profileRef}>
                <motion.button
                  className="avatar-btn"
                  onClick={() => setShowMenu(!showMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Profile"
                >
                  👤
                  <motion.span className="avatar-dot" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                </motion.button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      className="avatar-menu"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    >
                      <button className="am-btn" onClick={handleLogout}>🚪 Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ──── Main ──── */}
      <main className="main-area">
        <div className="container">
          <Hero results={results} />

          {/* ★ Mobile switcher — scrollable */}
          <div className="d-md-none mobile-scroll-nav">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                className={`mob-toggle ${activeView === v.id ? 'active' : ''}`}
                onClick={() => setActiveView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* ★ View content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeView === 'research' && (
                <ResearchView
                  results={results} loading={loading} error={error}
                  query={query} setQuery={setQuery}
                  queryHistory={queryHistory}
                  activeTab={activeTab} setActiveTab={setActiveTab}
                  handleSearch={handleSearch}
                  selectedTemplateId={selectedTemplateId}
                  setSelectedTemplateId={setSelectedTemplateId}
                />
              )}

              {activeView === 'templates' && (
                <TemplatesView
                  results={results}
                  selectedTemplateId={selectedTemplateId}
                  setSelectedTemplateId={setSelectedTemplateId}
                  lastQuery={results?.query || query}
                />
              )}

              {activeView === 'gallery' && <PaperTemplateGallery />}

              {activeView === 'verify' && <ReferenceVerifier />}

              {activeView === 'papers' && <ConferencePapers />}

              {activeView === 'conferences' && <ConferenceUpdates />}
            </motion.div>
          </AnimatePresence>

          <HumanizeSection />
          <HowItWorks />
          <div id="contact" className="contact-scroll-anchor">
  <GetInTouch />
</div>
          <RevealSection>
            <footer className="app-footer">
  <div className="footer-inner">
    {/* ✅ Brand block (logo above text) */}
    <div className="footer-brand-stack">
      <motion.div className="brand-logo logo-avatar logo-sm" whileHover={{ rotate: 6, scale: 1.05 }}>
  <img src="/research-dost-logo.png" alt="Research Dost" />
</motion.div>

      <div className="footer-brand-name">
  <BrandWordmark animate={false} /> {/* or animate={true} if you want */}
</div>
    </div>

    <p className="footer-copy">Built with ❤️ for researchers and students worldwide.</p>

   <div className="footer-links">
  <button
    className="footer-link-btn"
    type="button"
    onClick={() => setFooterModal("about")}
  >
    About
  </button>

  <button
    className="footer-link-btn"
    type="button"
    onClick={() => setFooterModal("privacy")}
  >
    Privacy
  </button>

  <button
    className="footer-link-btn"
    type="button"
    onClick={() => setFooterModal("terms")}
  >
    Terms
  </button>

  <button
    className="footer-link-btn"
    type="button"
    onClick={() => {
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }}
  >
    Contact
  </button>
</div>
</div>
</footer>
          </RevealSection>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}