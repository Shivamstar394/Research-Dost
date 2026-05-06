import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const CONFERENCE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'ai_ml', label: 'AI / ML', icon: '🤖' },
  { id: 'cs', label: 'Computer Science', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'bfsi', label: 'BFSI', icon: '🏦' },
]

// Fallback sample data when API is unavailable
const SAMPLE_PAPERS = [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: ['A. Vaswani', 'N. Shazeer', 'N. Parmar', 'J. Uszkoreit'],
    conference: 'NeurIPS 2017',
    category: 'ai_ml',
    doi: '10.48550/arXiv.1706.03762',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms...',
    year: 2017,
    citations: 95000,
    url: 'https://arxiv.org/abs/1706.03762',
  },
  {
    id: 2,
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['J. Devlin', 'M. Chang', 'K. Lee', 'K. Toutanova'],
    conference: 'NAACL-HLT 2019',
    category: 'ai_ml',
    doi: '10.18653/v1/N19-1423',
    abstract: 'We introduce BERT, a new language representation model which is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context...',
    year: 2019,
    citations: 72000,
    url: 'https://arxiv.org/abs/1810.04805',
  },
  {
    id: 3,
    title: 'Deep Learning for Electronic Health Records: A Comprehensive Review',
    authors: ['E. Choi', 'M. Bahadori', 'J. Sun'],
    conference: 'JAMIA 2022',
    category: 'healthcare',
    doi: '10.1093/jamia/ocx017',
    abstract: 'Electronic health records (EHRs) contain rich clinical information that can be leveraged by deep learning models for clinical prediction tasks...',
    year: 2022,
    citations: 1200,
    url: '#',
  },
  {
    id: 4,
    title: 'Blockchain-based Decentralized Finance: A Systematic Survey',
    authors: ['S. Werner', 'D. Perez', 'L. Gudgeon'],
    conference: 'ACM Computing Surveys 2023',
    category: 'bfsi',
    doi: '10.1145/3533482',
    abstract: 'Decentralized Finance (DeFi) is an ecosystem of financial applications built on top of blockchain networks. This survey systematically analyzes the DeFi ecosystem...',
    year: 2023,
    citations: 890,
    url: '#',
  },
  {
    id: 5,
    title: 'Efficient Transformers: A Survey of Efficient Approaches',
    authors: ['Y. Tay', 'M. Dehghani', 'D. Bahri', 'D. Metzler'],
    conference: 'ACM Computing Surveys 2022',
    category: 'cs',
    doi: '10.1145/3530811',
    abstract: 'Transformer model architectures have become ubiquitous in natural language processing. This survey characterizes and reviews efficient Transformer models...',
    year: 2022,
    citations: 3400,
    url: 'https://arxiv.org/abs/2009.06732',
  },
  {
    id: 6,
    title: 'Federated Learning for Medical Imaging: A Systematic Review',
    authors: ['N. Rieke', 'J. Hancox', 'W. Li', 'F. Milletari'],
    conference: 'Nature Machine Intelligence 2023',
    category: 'healthcare',
    doi: '10.1038/s42256-020-00211-4',
    abstract: 'Federated learning enables training of machine learning models across multiple institutions without the need to share patient data. This review covers applications in medical imaging...',
    year: 2023,
    citations: 2100,
    url: '#',
  },
]

export default function ConferencePapers() {
  const [papers, setPapers] = useState(SAMPLE_PAPERS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('citations') // citations | year

  const filtered = papers
    .filter((p) => activeCategory === 'all' || p.category === activeCategory)
    .filter(
      (p) =>
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.conference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.some((a) =>
          a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) =>
      sortBy === 'citations'
        ? b.citations - a.citations
        : b.year - a.year
    )

  const handleFetchPapers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/conference_papers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ category: activeCategory }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.papers?.length) setPapers(data.papers)
      }
    } catch {
      // Use fallback sample data
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cp-section">
      <div className="cp-header">
        <div>
          <h2 className="ws-title">📚 Sample Papers from Top Conferences</h2>
          <p className="ws-desc">
            Browse metadata from influential papers across AI, CS, Healthcare
            and BFSI. Only metadata is displayed — no full papers.
          </p>
        </div>
        <div className="cp-compliance-badge">
          <span>🔒</span> Copyright-compliant: Metadata only
        </div>
      </div>

      {/* Filters */}
      <div className="cp-filters">
        <div className="cp-categories">
          {CONFERENCE_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              className={`cp-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{cat.icon}</span> {cat.label}
            </motion.button>
          ))}
        </div>

        <div className="cp-controls">
          <div className="cp-search-wrap">
            <span className="cp-search-icon">🔍</span>
            <input
              type="text"
              className="cp-search-input"
              placeholder="Search papers, authors, or conferences…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="cp-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="citations">Sort by Citations</option>
            <option value="year">Sort by Year</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="cp-results-info">
        Showing <strong>{filtered.length}</strong> paper
        {filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'all' && (
          <> in <strong>{CONFERENCE_CATEGORIES.find((c) => c.id === activeCategory)?.label}</strong></>
        )}
      </div>

      {/* Paper cards */}
      <div className="cp-grid">
        <AnimatePresence>
          {filtered.map((paper, idx) => (
            <motion.div
              key={paper.id}
              className="cp-card"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
            >
              <div className="cp-card-top">
                <span className="cp-card-cat">
                  {CONFERENCE_CATEGORIES.find((c) => c.id === paper.category)?.icon}{' '}
                  {paper.conference}
                </span>
                <span className="cp-card-year">{paper.year}</span>
              </div>

              <h4 className="cp-card-title">{paper.title}</h4>

              <p className="cp-card-authors">
                👤{' '}
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 &&
                  ` +${paper.authors.length - 3}`}
              </p>

              <p className="cp-card-abstract">{paper.abstract}</p>

              <div className="cp-card-meta">
                <span className="cp-meta-item">
                  📊 {paper.citations.toLocaleString()} citations
                </span>
                {paper.doi && (
                  <span className="cp-meta-item cp-doi">
                    DOI: {paper.doi}
                  </span>
                )}
              </div>

              <motion.a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="paper-link"
                whileHover={{ x: 4 }}
              >
                View metadata <span>→</span>
              </motion.a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="cp-empty">
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <p>No papers match your filters. Try a different category or search term.</p>
        </div>
      )}
    </div>
  )
}