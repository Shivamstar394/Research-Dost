import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// ──────────────── Dismiss Loader ────────────────

function dismissLoader() {
  const loader = document.getElementById('app-loader')
  if (!loader) return

  requestAnimationFrame(() => {
    setTimeout(() => {
      loader.classList.add('fade-out')
      loader.addEventListener('transitionend', () => loader.remove(), { once: true })
      setTimeout(() => {
        if (document.getElementById('app-loader')) loader.remove()
      }, 1000)
    }, 500)
  })
}

// ──────────────── Root Error Boundary ────────────────

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Root Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', marginBottom: '1.5rem',
            boxShadow: '0 12px 40px rgba(239,68,68,0.2)',
          }}>⚠️</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 460, marginBottom: '1rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <pre style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
              padding: '0.75rem 1.25rem', fontSize: '0.78rem', color: '#dc2626',
              maxWidth: 500, overflow: 'auto', marginBottom: '1.5rem',
              fontFamily: "'JetBrains Mono', monospace", textAlign: 'left',
            }}>{this.state.error.message}</pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem', borderRadius: 999, border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(79,70,229,0.3)',
            }}
          >Reload page</button>
        </div>
      )
    }
    return this.props.children
  }
}

// ──────────────── Mount ────────────────

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </RootErrorBoundary>
    </React.StrictMode>
  )
  dismissLoader()
}