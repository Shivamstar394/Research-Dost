# Autonomous AI Research Agent

An intelligent research assistant that searches academic papers, summarizes them, and generates structured research notes using LLMs and RAG.

## Features

- 🔍 **Paper Search**: Search ArXiv and PubMed simultaneously
- 📚 **Intelligent Summarization**: AI-powered paper summaries
- 📋 **Research Notes**: Auto-generated structured research documentation
- 🤖 **RAG Pipeline**: Retrieval-Augmented Generation for contextual answers
- 🚀 **Full-Stack**: FastAPI backend + React frontend
- 📖 **Production-Ready**: Modular, scalable architecture

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# Run server
python app.py
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend available at http://localhost:5173
```

## Usage Examples

### API Direct Usage
```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "reinforcement learning in robotics",
    "sources": ["arxiv", "pubmed"]
  }'
```

### Python Script
```python
from agents.research_agent import ResearchAgent

agent = ResearchAgent()
results = agent.research("quantum computing advances")

print(results['answer'])
print(results['research_notes'])
```

## Architecture

The system follows a modular microservices-inspired architecture:

1. **API Layer** (routes.py): HTTP endpoints
2. **Agent Layer** (research_agent.py): Orchestration logic
3. **Service Layer**: Specialized services for each function
   - ArxivService: Paper fetching
   - PubmedService: Biomedical literature
   - RAGService: Embeddings and retrieval
   - LLMService: AI interactions
4. **Utils Layer**: Logging, caching, validation

## Configuration

Edit `backend/config.py` to customize:

- LLM model (Claude, GPT-4, etc.)
- Embedding model
- Chunk size for RAG
- API rate limits
- CORS settings

## Dependencies

### Backend
- FastAPI: Web framework
- LangChain: LLM orchestration (optional future)
- Sentence-Transformers: Embeddings
- Anthropic SDK: Claude integration

### Frontend
- React 18: UI framework
- Vite: Build tool

## Error Handling

The system includes comprehensive error handling:

- API validation with Pydantic
- Graceful API failure handling
- Comprehensive logging
- User-friendly error messages

## Performance Tips

1. Enable caching for repeated queries
2. Adjust chunk size for faster processing
3. Limit TOP_K_PAPERS for fewer API calls
4. Use lighter embedding model for speed

## Future Enhancements

- [ ] Support for more paper sources (IEEE, ACL, etc.)
- [ ] Advanced query syntax
- [ ] Research paper annotation
- [ ] Collaborative research spaces
- [ ] Paper citation graph visualization
- [ ] Docker containerization
- [ ] Database persistence
- [ ] User authentication

## Troubleshooting

**API Error 401**: Check ANTHROPIC_API_KEY
**No papers found**: Verify internet connection or try different query
**Slow response**: Increase chunk size or reduce TOP_K_PAPERS

## License

MIT