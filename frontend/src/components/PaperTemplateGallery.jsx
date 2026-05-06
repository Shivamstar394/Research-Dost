import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TEMPLATE_SAMPLES = [
  {
    id: 'ieee',
    name: 'IEEE Conference',
    badge: 'Popular',
    icon: '⚡',
    color: '#00629B',
    description: 'Two-column format with numbered sections, standard for IEEE conferences and transactions.',
    preview: {
      title: 'Deep Reinforcement Learning for Autonomous Navigation',
      authors: 'J. Smith, A. Kumar, M. Chen',
      affiliation: 'Dept. of Computer Science, MIT',
      abstract: 'This paper presents a novel deep reinforcement learning approach for autonomous robot navigation in complex environments. We propose a hierarchical policy architecture that combines global path planning with local obstacle avoidance...',
      sections: ['I. Introduction', 'II. Related Work', 'III. Methodology', 'IV. Experiments', 'V. Results', 'VI. Conclusion'],
      keywords: ['Deep learning', 'Reinforcement learning', 'Autonomous navigation', 'Robotics'],
      format: 'Two-column, 10pt Times New Roman, US Letter',
      pageLimit: '6-8 pages',
      citation: 'Numbered [1], [2]',
    },
    // Replace with your actual image path
    sampleImage: '/templates/ieee-sample.png',
  },
  {
    id: 'springer',
    name: 'Springer LNCS',
    badge: 'Workshops',
    icon: '📗',
    color: '#0070A8',
    description: 'Single-column LNCS format used in Springer conference proceedings and lecture notes.',
    preview: {
      title: 'Federated Learning for Privacy-Preserving Healthcare Analytics',
      authors: 'L. Zhang, R. Patel, S. Johnson',
      affiliation: 'AI Research Lab, Stanford University',
      abstract: 'We introduce a federated learning framework designed for privacy-preserving medical data analysis. Our approach enables multiple hospitals to collaboratively train machine learning models without sharing sensitive patient data...',
      sections: ['1 Introduction', '2 Background', '3 Proposed Method', '4 Experimental Setup', '5 Results and Discussion', '6 Conclusion'],
      keywords: ['Federated learning', 'Privacy', 'Healthcare', 'Machine learning'],
      format: 'Single-column, 10pt Computer Modern, A4',
      pageLimit: '12-16 pages',
      citation: 'Numbered [1], [2]',
    },
    sampleImage: '/templates/springer-sample.png',
  },
  {
    id: 'acm',
    name: 'ACM SIGCONF',
    badge: 'CS',
    icon: '💻',
    color: '#0085CA',
    description: 'ACM proceedings format with CCS concepts, widely used in top CS conferences.',
    preview: {
      title: 'Scalable Graph Neural Networks for Social Network Analysis',
      authors: 'K. Wang, T. Brown, P. Davis',
      affiliation: 'School of Computing, Carnegie Mellon University',
      abstract: 'We present a scalable graph neural network architecture for analyzing large-scale social networks. Our model handles graphs with millions of nodes by employing a novel sampling strategy combined with attention-based aggregation...',
      sections: ['1 Introduction', '2 Related Work', '3 Model Architecture', '4 Experiments', '5 Analysis', '6 Conclusion'],
      keywords: ['Graph neural networks', 'Social networks', 'Scalability', 'Deep learning'],
      format: 'Two-column, 9pt Libertine, US Letter',
      pageLimit: '10-12 pages',
      citation: 'Numbered [1], [2]',
    },
    sampleImage: '/templates/ACM-sample.png',
  },
  {
    id: 'elsevier',
    name: 'Elsevier Journal',
    badge: 'Journals',
    icon: '🔬',
    color: '#FF6C00',
    description: 'Standard journal article format used by Elsevier across science and engineering.',
    preview: {
      title: 'A Comprehensive Study of Transfer Learning in Medical Imaging',
      authors: 'M. Garcia, H. Lee, F. Wilson',
      affiliation: 'Biomedical Engineering, Johns Hopkins University',
      abstract: 'This comprehensive study evaluates transfer learning strategies for medical image classification across multiple imaging modalities. We systematically compare pretrained models from ImageNet with domain-specific pretraining on medical datasets...',
      sections: ['1. Introduction', '2. Materials and Methods', '3. Results', '4. Discussion', '5. Conclusion'],
      keywords: ['Transfer learning', 'Medical imaging', 'Deep learning', 'Classification'],
      format: 'Single-column review, double-spaced, 12pt',
      pageLimit: 'No strict limit (typically 8-20 pages)',
      citation: 'Numbered [1], [2] or Author-Year',
    },
    sampleImage: '/templates/elsevier-sample.png',
  },
]

export default function PaperTemplateGallery() {
  const [selectedId, setSelectedId] = useState('ieee')
  const [viewMode, setViewMode] = useState('preview') // preview | structure | image

  const selected = TEMPLATE_SAMPLES.find((t) => t.id === selectedId)

  return (
    <div className="tg-section">
      <div className="tg-header">
        <div>
          <h2 className="ws-title">📄 Paper Template Gallery</h2>
          <p className="ws-desc">
            Explore sample paper formats from major publishers. View structure,
            formatting rules, and sample layouts.
          </p>
        </div>
      </div>

      {/* Template selector */}
      <div className="tg-selector">
        {TEMPLATE_SAMPLES.map((tpl) => (
          <motion.button
            key={tpl.id}
            className={`tg-chip ${selectedId === tpl.id ? 'active' : ''}`}
            onClick={() => setSelectedId(tpl.id)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="tg-chip-icon">{tpl.icon}</span>
            <span className="tg-chip-name">{tpl.name}</span>
            <span className="tg-chip-badge">{tpl.badge}</span>
          </motion.button>
        ))}
      </div>

      {/* View mode */}
      <div className="tg-view-toggle">
        {[
          { id: 'preview', label: '📋 Preview', },
          { id: 'structure', label: '🏗️ Structure' },
          { id: 'image', label: '🖼️ Sample Image' },
        ].map((v) => (
          <button
            key={v.id}
            className={`tg-view-btn ${viewMode === v.id ? 'active' : ''}`}
            onClick={() => setViewMode(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={`${selectedId}-${viewMode}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'preview' && (
              <div className="tg-preview-card">
                <div className="tg-paper-mock">
                  {/* Paper header */}
                  <div className="tg-mock-header">
                    <div
                      className="tg-publisher-bar"
                      style={{ background: selected.color }}
                    >
                      {selected.icon} {selected.name} Format
                    </div>
                    <h3 className="tg-mock-title">{selected.preview.title}</h3>
                    <p className="tg-mock-authors">{selected.preview.authors}</p>
                    <p className="tg-mock-affil">
                      <em>{selected.preview.affiliation}</em>
                    </p>
                  </div>

                  {/* Abstract */}
                  <div className="tg-mock-section">
                    <strong>Abstract—</strong>
                    <span className="tg-mock-abstract">
                      {selected.preview.abstract}
                    </span>
                  </div>

                  {/* Keywords */}
                  <div className="tg-mock-keywords">
                    <strong>Keywords: </strong>
                    {selected.preview.keywords.join(', ')}
                  </div>

                  {/* Section list */}
                  <div className="tg-mock-sections">
                    {selected.preview.sections.map((sec, i) => (
                      <div key={i} className="tg-mock-sec-item">
                        <span className="tg-sec-name">{sec}</span>
                        <span className="tg-sec-placeholder">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Sed do eiusmod tempor incididunt ut labore…
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format info sidebar */}
                <div className="tg-format-info">
                  <h4 className="tg-info-title">Format Details</h4>
                  <div className="tg-info-grid">
                    <div className="tg-info-item">
                      <span className="tg-info-label">Layout</span>
                      <span className="tg-info-val">{selected.preview.format}</span>
                    </div>
                    <div className="tg-info-item">
                      <span className="tg-info-label">Page Limit</span>
                      <span className="tg-info-val">{selected.preview.pageLimit}</span>
                    </div>
                    <div className="tg-info-item">
                      <span className="tg-info-label">Citation Style</span>
                      <span className="tg-info-val">{selected.preview.citation}</span>
                    </div>
                    <div className="tg-info-item">
                      <span className="tg-info-label">Sections</span>
                      <span className="tg-info-val">
                        {selected.preview.sections.length} standard sections
                      </span>
                    </div>
                  </div>
                  <p className="tg-info-desc">{selected.description}</p>
                </div>
              </div>
            )}

            {viewMode === 'structure' && (
              <div className="tg-structure-card">
                <div className="tg-structure-visual">
                  {selected.preview.sections.map((sec, i) => (
                    <motion.div
                      key={i}
                      className="tg-struct-item"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <span className="tg-struct-num">{i + 1}</span>
                      <span className="tg-struct-name">{sec}</span>
                      <div className="tg-struct-bar">
                        <motion.div
                          className="tg-struct-fill"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              i === 0
                                ? 30
                                : i === selected.preview.sections.length - 1
                                ? 25
                                : 40 + Math.random() * 40
                            }%`,
                          }}
                          transition={{ delay: i * 0.06 + 0.2, duration: 0.5 }}
                          style={{ background: selected.color }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'image' && (
              <div className="tg-image-card">
                <div className="tg-image-wrap">
                  <img
                    src={selected.sampleImage}
                    alt={`${selected.name} sample`}
                    className="tg-template-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="tg-image-placeholder" style={{ display: 'none' }}>
                    <span style={{ fontSize: '3rem' }}>{selected.icon}</span>
                    <p>
                      Place <strong>{selected.name}</strong> sample image at:
                    </p>
                    <code>{selected.sampleImage}</code>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}