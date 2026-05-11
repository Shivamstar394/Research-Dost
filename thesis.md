# Thesis Report: Autonomous AI Research Agent (Research Dost)

**Author:** (Your Name)

**Department/College:** (Your College)

**Course:** (Your Course)

**Submission Date:** (Tomorrow)

---

## Abstract
This project presents **Autonomous AI Research Agent** (“Research Dost”), a full-stack application that helps users perform literature discovery, understand academic papers, and generate structured research notes and paper drafts. The system combines (1) **multi-source paper retrieval** (e.g., arXiv, PubMed, Crossref, DOAJ, SSRN, Springer, IEEE Xplore, Semantic Scholar), (2) **RAG-style retrieval augmentation** using **Sentence-Transformers embeddings**, and (3) **LLM generation** using **Anthropic Claude**. A modular backend orchestrates retrieval and generation through an agent layer, while the frontend provides an interactive workspace for queries, summarization views, templates, verification tools, and exports.

A key design goal is **robustness**: whenever LLM calls fail or are unavailable, the system falls back to deterministic summaries and structured template generation so the UI remains usable.

---

## 1. Introduction
Academic research is time-consuming: searching for relevant papers, reading abstracts, comparing findings, and drafting survey sections often requires substantial manual effort. This project automates the workflow by providing:

1. **Paper Search** across multiple scholarly sources.
2. **Intelligent Summarization** of each paper.
3. **Synthesized Research Notes** in a structured format.
4. **Draft Section Generation** using paper templates (e.g., IEEE-style output).
5. **Reference Verification (best-effort)** using DOI extraction and Crossref metadata.
6. **Authentication and user session management** via JWT and OTP/Google login.

---

## 2. System Overview (Architecture)
The system follows a modular, microservices-inspired layered architecture:

### 2.1 Backend (Python / FastAPI)
Core layers:
- **API Layer**: request/response routes (FastAPI routers).
- **Agent Layer**: `ResearchAgent` orchestrates retrieval → RAG → summarization → generation.
- **Service Layer**: specialized services for each external data source and LLM tasks.
- **Utils Layer**: logging, caching, validation, email sending.
- **Auth Layer**: signup/login, JWT token creation, OTP flow, and Google OAuth.

### 2.2 Frontend (React / Vite)
Core UI features:
- Login and registration flows.
- Authenticated dashboard with multiple views:
  - **Research** workspace (query + results tabs)
  - **Templates** page for outline/AI section generation
  - **Papers** summaries list
  - **Verify** references tool
  - **Conferences** pages
  - **Exports** for draft formats
- Animated experience using Framer Motion.

---

## 3. Technologies Used

### 3.1 Backend Stack
- **FastAPI**: API framework, async endpoints, automatic schema/docs.
- **Uvicorn**: server to run FastAPI.
- **Pydantic v2**: request/response validation.
- **JWT / jose**: stateless authentication.
- **Google OAuth**: Google identity verification.
- **httpx**: async HTTP calls for Crossref verification.
- **anthropic SDK**: Claude integration.
- **Sentence-Transformers**: embeddings for semantic retrieval.
- **NumPy**: similarity computations.
- **Logging**: structured logs via custom logger.

### 3.2 Frontend Stack
- **React (v19)**: UI components and state management.
- **React Router**: routing between login and dashboard.
- **Vite**: bundling and dev server.
- **Framer Motion**: animations, transitions, scroll-driven effects.
- **Bootstrap / Tailwind-like utilities**: styling support.
- **react-joyride**: guided tour component.

---

## 4. Backend Deep Dive

### 4.1 Application Startup and Lifespan
The backend initializes a FastAPI app with a modern **lifespan** handler (startup/shutdown logging). CORS is configured using values from configuration settings.

### 4.2 Routing and Endpoints
The backend exposes core routes:

- `GET /health`: health check.
- `POST /research`: main research pipeline endpoint.
- `POST /draft_sections`: generates structured paper sections.
- `GET /sources`: lists supported sources.
- `POST /generate_prompt`: produces a copy-ready external AI prompt.
- `GET /query_history`: returns saved query history for the authenticated user.
- `POST /verify_references`: best-effort reference verification.

### 4.3 Research Query Pipeline (`ResearchAgent`)
The `ResearchAgent` is the main orchestrator.

#### 4.3.1 Source Search (`_search_papers`)
Pipeline logic:
1. Determine if the query is **medical/biomedical** through keyword heuristics.
2. Apply source filtering:
   - For medical queries: include PubMed and general sources.
   - For non-medical queries: exclude PubMed.
3. Call each service’s `search_papers(query, max_results=limit)`.
4. Apply rate-limit protection via a `time.sleep(1)` between calls.
5. Deduplicate results by paper title.
6. Sort papers by extracted publication year (latest first).

This creates a unified list of candidate papers from multiple repositories.

#### 4.3.2 RAG Index Building (`RAGService`)
After retrieval, the system builds a simple in-memory RAG index:

- **Chunking**:
  - Combines title and summary into text:
    - `Title: ...\n\nSummary: ...`
  - Splits into overlapping chunks (`chunk_size` and `overlap` from config).
- **Embedding generation**:
  - Lazy-loads a Sentence-Transformer model (`_ensure_model_loaded`).
  - Encodes chunk texts into embedding vectors.
- **Similarity retrieval**:
  - Encodes the query.
  - Computes similarity using vector dot product:
    - `query_embedding @ embeddings.T`
  - Selects top-k chunks with positive similarity.

Returned results include chunk text and metadata (paper title, authors, url, source, relevance score).

#### 4.3.3 Context Construction
The agent concatenates retrieved chunk texts into a single context string (bounded by top chunk selection and downstream prompt length).

#### 4.3.4 Research Notes Generation (`LLMService.generate_research_notes`)
- Builds a context pack from top papers.
- Includes a template hint when a template_id exists.
- Calls Claude using `_call_claude`.
- If Claude fails or returns missing template sections, the service generates a deterministic structured fallback:
  - Section headings from the template
  - Lightweight keyword extraction from the query
  - References list built from top papers

#### 4.3.5 Answer Generation (`LLMService.answer_research_question`)
- Uses the RAG context as the only evidence.
- Claude call is attempted.
- If Claude is unavailable, the system falls back to a context excerpt answer.

#### 4.3.6 Paper Summaries (`LLMService.summarize_paper`)
For robustness and cost:
- Summarization primarily uses the paper’s existing **abstract/summary** field.
- If missing, returns a minimal “Paper: Title” placeholder.

#### 4.3.7 Draft Sections Generation (`ResearchAgent.draft_sections`)
- Searches a smaller set of base sources (typically arXiv, PubMed, Crossref, DOAJ).
- Selects top papers (`top_papers` control).
- Calls `LLMService.generate_draft_sections`:
  - For each requested section (e.g., Abstract, Introduction), generate 2–5 paragraphs with inline citations [1], [2].
  - Fallback provides generic guidance when LLM fails.
- For IEEE templates, optionally generates IEEE LaTeX using template utilities.

---

## 5. LLM Integration and Reliability Design

### 5.1 Claude Calling Strategy
`LLMService` uses a resilient calling pattern:
- Initializes Anthropics client using `ANTHROPIC_API_KEY`.
- `_call_claude()` supports both:
  - **messages API** (newer SDK)
  - **completions API** (legacy)

### 5.2 Fail-Safe Fallbacks
A core requirement in this project is that the UI should never show a generic LLM error message.

Therefore:
- On any API error, `_call_claude` returns `None`.
- The higher-level functions detect missing output and provide deterministic fallback text.

This ensures:
- Stable demos
- Usable outputs even without API keys
- Predictable behavior during evaluation

---

## 6. Authentication and Authorization (Auth System)

### 6.1 Signup and Login
- `POST /auth/signup`: creates a user with email/password.
- `POST /auth/login`: verifies credentials.
- Both produce a **JWT access token**.

### 6.2 OTP-Based Password Recovery
- `POST /auth/request-otp`: generates and emails OTP.
- `POST /auth/verify-otp`: validates OTP and returns a new token.
- `POST /auth/reset-password`: updates password.

### 6.3 Google OAuth
- `POST /auth/google` verifies Google ID tokens.
- Extracts email/name/picture/sub.
- Creates or gets the user in the DB.
- Returns a JWT.

### 6.4 Protected Routes
The frontend uses `ProtectedRoute` so only authenticated users can access the dashboard.

---

## 7. Data Storage and Query History
The system stores query history in MongoDB collections (via `backend/db.py`).

When a research request is made:
- The backend inserts a document containing email, query, sources, template id, created_at, and type.
- It then updates inserted records with metrics like papers_found and sources_used.

The frontend reads history via:
- `GET /query_history?limit=40`

---

## 8. Reference Verification Feature
Endpoint: `POST /verify_references`

Workflow:
1. Extract DOI from each raw reference string using regex:
   - pattern for `10.xxxx/...`
2. If DOI exists, verify using Crossref:
   - `https://api.crossref.org/works/{doi}`
3. If DOI missing or low confidence, run Crossref bibliographic query.
4. Determine a confidence score via heuristics.
5. Best-effort mapping to source domains (IEEE/Springer/ACM) using publisher string checks.

The system avoids fake verification for sources like Scopus where no public verification API is integrated.

---

## 9. Frontend Deep Dive

### 9.1 Layout and Routing
The main `App.jsx` uses React Router and redirects:
- `/` → `/login`
- Protected `/dashboard`.

### 9.2 Dashboard Navigation and Views
The dashboard includes:
- Research view
- Templates view
- Gallery
- Verify references
- Papers summaries
- Conferences updates

Navigation is animated, scroll-friendly, and includes a guided tour using Joyride.

### 9.3 Research Workspace UI
In the Research view:
- User enters a query.
- Selects a notes template.
- Clicks “Search papers”.

The UI calls backend:
- `POST /research`

Results are displayed with tabs:
- Answer
- Notes (research_notes displayed in preformatted block)
- Papers (paper_summaries list with read links)

### 9.4 Template Generation and Drafting
In Templates view:
- User chooses a template style (IEEE / Springer / ACM / Elsevier / IMRaD / etc.).
- User can generate a Markdown outline locally (deterministic).
- User can also click “Auto-generate AI sections” which calls:
  - `POST /draft_sections`

Returned data includes:
- `markdown`
- `latex_ieee` (for IEEE template)

### 9.5 Export Section
The frontend integrates export options through `ExportSection`.

---

## 10. Functionalities and Core Features (Checklist)

### 10.1 Core Literature Workflow
- Multi-source paper retrieval
- Intelligent medical query detection
- Deduplication and sorting
- RAG retrieval augmentation
- Synthesized notes generation
- Paper summaries
- Answer generation constrained by retrieved context

### 10.2 Drafting Workflow
- Select templates
- Generate section content for user-chosen headings
- Inline citations instruction
- Optional IEEE LaTeX output

### 10.3 Verification Workflow
- DOI extraction from references
- Crossref-based best-effort verification
- Confidence scoring
- Source link suggestions

### 10.4 Authentication Workflow
- Email/password signup/login
- OTP password recovery
- Google OAuth
- JWT-protected dashboard

---

## 11. Testing, Performance, and Practical Considerations

### 11.1 Performance Strategy
- **Lazy loading** for embeddings model in `RAGService`.
- **Rate limit protection** when calling multiple external sources.
- **Top-k selection** to reduce context size.
- Deterministic fallbacks to avoid total failure.

### 11.2 Reliability Strategy
- Avoids UI error messaging from LLM failures.
- Ensures returned objects match the expected API response models.
- Uses deterministic structure when LLM responses are incomplete.

---

## 12. Limitations
- RAG index is **in-memory** per query; no persistent vector database.
- Deduplication uses title uniqueness; may merge distinct papers with identical titles.
- Medical detection is keyword heuristic, not clinical NER or ontology-based.
- Verification is best-effort; publisher-to-source mapping is heuristic.
- Some external sources may have unstable APIs (e.g., DOAJ noted as disabled for stability in service layer).

---

## 13. Future Work
- Persistent embeddings/vector store (e.g., FAISS/Chroma) for caching across queries.
- Expand and harden scraping/metadata normalization per publisher.
- Add collaborative workspaces for teams.
- Improve reference matching with more advanced bibliographic parsing.
- Add visualization: citation graphs, topic clustering, timeline charts.
- Stronger RAG: multi-hop retrieval and citation grounding.

---

## 14. Conclusion
Research Dost demonstrates a practical end-to-end system for autonomous literature review: it automates searching across scholarly sources, builds a retrieval-augmented context, and uses an LLM to generate structured research notes and draft sections. Its architectural modularity, robust LLM fallback design, and user-centered frontend enable reliable evaluation and usability. The project can serve as a foundation for more advanced research automation and academic writing workflows.

---

## References (for your thesis submission)
(Write references according to your college format)
- FastAPI Documentation
- React Documentation
- Anthropic Claude API Documentation
- Sentence-Transformers Documentation
- Crossref REST API Documentation

---

## Appendix A: Repository Structure Summary
- `backend/app.py`: FastAPI application bootstrap with lifespan.
- `backend/api/routes.py`: research endpoints.
- `backend/agents/research_agent.py`: orchestration.
- `backend/services/*`: data source services and LLM/RAG components.
- `backend/auth/*`: authentication flows.
- `frontend/src/App.jsx`: dashboard UI and interactions.

