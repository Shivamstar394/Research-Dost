# Autonomous AI Research Agent - Project Synopsis Report

## 🎯 **Project Overview**
**Research Dost** is a full-stack autonomous AI research assistant designed to streamline academic literature review and paper drafting. Users input natural-language research queries, and the system intelligently searches multiple academic databases, generates AI-powered summaries and research notes, and auto-generates structured paper drafts using standard templates (IEEE, Springer, ACM, Elsevier, IMRaD).

**Tagline**: \"From research question → papers → understanding → draft, all in one workspace.\"

**Status**: Production-ready MVP with authentication, Docker support, and modular architecture.

## 🛠️ **Technology Stack**

### **Backend** (FastAPI/Python)
```
FastAPI 0.104.1    | Web API framework
Uvicorn 0.24.0     | ASGI server
Pydantic 2.5.2     | Data validation
Anthropic 0.30.1   | Claude LLM integration
Sentence-Transformers 2.3.0 | RAG embeddings
Torch/Transformers | AI/ML processing
Requests/httpx     | API clients & scraping
Redis (Docker)     | Caching (optional)
PostgreSQL (ready) | Future persistence
Docker Compose     | Container orchestration
```
- **Key Files**: `app.py`, `requirements.txt`, `config.py`
- **Architecture**: Modular services + agent orchestration + RAG pipeline

### **Frontend** (React 19 + Vite)
```
React 19.2.0          | UI framework
React Router 7.13.1   | Routing
TailwindCSS 4.1.18    | Styling
Framer Motion 12.29.2 | Animations
Bootstrap 5.3.8       | Components
tsparticles 3.9.1     | Visual effects
Google OAuth          | Auth integration
```
- **Key Files**: `App.jsx`, `package.json`, `vite.config.js`
- **Features**: Responsive dashboard, animated UI, real-time results, paper template gallery

### **Infrastructure**
```
Docker Compose     | Multi-service orchestration
Redis 7-alpine     | Caching layer
Nginx (optional)   | Reverse proxy
PostgreSQL (ready) | Database layer
```

## 🔍 **Core Features & Capabilities**

### **1. Intelligent Paper Search (Multi-Source)**
```
✅ ArXiv                    | Preprints (20 results)
✅ PubMed                   | Biomedical (10 results) 
✅ Semantic Scholar         | Academic graph (20 results)
✅ CrossRef                 | Metadata (10 results)
✅ DOAJ                     | Open Access (10 results)
✅ SSRN                     | Social Sciences (10 results)
✅ Springer                 | Journals/Books (10 results)
✅ IEEE Xplore              | Engineering (10 results)
```
- **Medical Query Detection**: Automatically prioritizes PubMed for biomedical topics
- **Deduplication & Sorting**: By title + recency (year descending)
- **Rate-Limit Safe**: 1s delays between API calls

### **2. RAG Pipeline (Retrieval-Augmented Generation)**
```
1. Chunk papers (configurable: 512 tokens, 20% overlap)
2. Lazy-load SentenceTransformer embeddings
3. Vector similarity search (cosine similarity)
4. Top-K retrieval (default: 5 chunks)
5. Context injection to LLM
```

### **3. AI-Powered Research Outputs**
```
🤖 Research Notes          | Structured summaries + synthesis
💬 Contextual Answers      | Citation-backed responses
📄 Paper Summaries         | Per-paper TL;DR
📋 Draft Sections          | Template-specific content generation
```

### **4. Paper Templates & Export**
```
📄 IEEE Conference         | Abstract → References (8 sections)
📚 Springer/LNCS           | Workshop format
💻 ACM Article             | CS conferences
🔬 Elsevier Journal        | Traditional journals
📝 Generic IMRaD           | Flexible research structure
```
- **AI Section Generation**: Fills templates with research-backed content
- **LaTeX Export**: IEEE format ready
- **Markdown Export**: Copy-paste ready

### **5. Authentication & UX**
```
🔐 JWT-based auth          | Login/Signup/OTP/Forgot Password
🛡️ Protected routes
📱 Fully responsive        | Mobile-first design
⚡ Animated UI             | Framer Motion + particles
📊 Real-time metrics       | Papers found, sources used
```

### **6. Dashboard Views**
```
🔬 Research Workspace      | Core search + results
📋 Paper Templates         | Outline + AI generation
📄 Template Gallery        | Visual previews
🔍 Reference Verifier      | Citation checking
📚 Conference Papers       | Upcoming deadlines
🗓️ Conference Updates     | RSS feeds + alerts
```

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│   FastAPI API    │◄──►│ Academic APIs   │
│  (Vite/Tailwind)│    │ (CORS/JWT)       │    │ ArXiv/PubMed... │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌──────────────────┐
                    │ ResearchAgent    │
                    │ Orchestrator     │
                    └──────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ RAGService│ │LLMService│ │SearchSvcs│
         │ Embeddings│ │Claude-3.5│ │ArXiv+... │
         └──────────┘ └──────────┘ └──────────┘
```

## 🚀 **Quick Start**
```bash
# Backend
cd backend && pip install -r requirements.txt && python app.py
# Frontend  
cd frontend && npm install && npm run dev

# Docker (one command)
docker-compose up --build
```

**Endpoints**:
- `POST /research` → Core search
- `POST /draft_sections` → Template generation  
- `http://localhost:8000/docs` → Swagger UI

## 📈 **Performance & Scalability**
```
✅ Lazy model loading          | No cold starts
✅ Redis caching               | Repeated queries
✅ Async services              | Non-blocking I/O
✅ Rate limiting               | API protection
✅ Configurable chunking       | Balance speed/quality
✅ Medical query optimization  | Source prioritization
```

## 🔮 **Future Roadmap** (from README)
```
[ ] More sources (ACL, NeurIPS, CVPR)
[ ] Citation graphs  
[ ] Collaborative workspaces
[ ] Paper annotation tools
[ ] Vector DB (Pinecone/Weaviate)
[ ] Long-term user history
```

## 💎 **Key Strengths**
1. **Production-Ready**: Dockerized, logged, error-handled
2. **Intelligent**: Medical detection, source filtering, deduplication
3. **Comprehensive**: 8+ academic sources + RAG + templates
4. **Beautiful UX**: Animated React dashboard
5. **Extensible**: Service-per-source architecture

**Project Health**: Excellent structure, modern stack, clear separation of concerns, comprehensive README, Docker-ready.

---

**Generated by BLACKBOXAI** | Analyzed: 50+ files | Technologies: Python/FastAPI + React/Vite | Status: MVP Complete ✅

