import os
from dotenv import load_dotenv
from functools import lru_cache
from pathlib import Path

# Load .env explicitly from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Application configuration"""

    # API Keys
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    SPRINGER_API_KEY = os.getenv("SPRINGER_API_KEY", "")
    IEEE_XPLORE_API_KEY = os.getenv("IEEE_XPLORE_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Service URLs
    ARXIV_BASE_URL = "http://export.arxiv.org/api/query"
    PUBMED_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    # Model Configuration
    LLM_MODEL = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"

    # RAG Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K_PAPERS = 50
    TOP_K_CHUNKS = 30

    # FastAPI Configuration
    API_TITLE = "Autonomous Research Agent API"
    API_VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]

    # Caching
    ENABLE_CACHE = True
    CACHE_TTL = 3600

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # Database Configuration
    MONGO_URI = os.getenv("MONGO_URI", "")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "")
    JWT_SECRET = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    # ✅ FIXED: Read Google Client ID from .env
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


@lru_cache()
def get_settings():
    return Settings()