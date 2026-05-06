"""
COMPLETE UPDATED backend/app.py
Replace your entire app.py with this code
This uses modern FastAPI lifespan instead of deprecated on_event
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.routes import router
from config import get_settings
from utils.logger import get_logger
from auth.auth_routes import router as auth_router
from api.conferences_routes import router as conferences_router
settings = get_settings()
logger = get_logger(__name__)


# ============================================================
# MODERN LIFESPAN HANDLER (replaces deprecated on_event)
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern way to handle startup and shutdown events in FastAPI
    
    Everything before 'yield' runs at startup
    Everything after 'yield' runs at shutdown
    """
    # ===== STARTUP CODE =====
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("Note: Embedding model will load on first search (lazy loading)")
    
    yield  # App is now running
    
    # ===== SHUTDOWN CODE =====
    logger.info(f"Shutting down {settings.API_TITLE}")


# ============================================================
# CREATE FASTAPI APP WITH LIFESPAN
# ============================================================
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Autonomous AI Research Agent - Search, summarize, and analyze academic papers",
    lifespan=lifespan  # Use modern lifespan instead of on_event
)

# ============================================================
# ADD CORS MIDDLEWARE
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# INCLUDE ROUTES
# ============================================================
app.include_router(router)
app.include_router(auth_router)
app.include_router(conferences_router) 
# ============================================================
# ROOT ENDPOINT
# ============================================================
@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "message": "Welcome to Autonomous Research Agent",
        "docs": "/docs",
        "version": settings.API_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",  # ✅ CORRECT - import string format
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )