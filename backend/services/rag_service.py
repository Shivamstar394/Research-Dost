from typing import List, Dict, Any
from config import get_settings
from utils.logger import get_logger
import numpy as np

logger = get_logger(__name__)
settings = get_settings()

class RAGService:
    """Retrieval-Augmented Generation pipeline with lazy loading"""
    
    def __init__(self):
        """Initialize RAG service - do NOT load model here"""
        logger.info("Initializing RAG service (lazy loading)")
        self.embedding_model = None  # Will be loaded on first use
        self.chunks = []
        self.embeddings = []
    
    def _ensure_model_loaded(self):
        """Load embedding model only when needed (lazy loading)"""
        if self.embedding_model is None:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            try:
                from sentence_transformers import SentenceTransformer
                self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info("Embedding model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {str(e)}")
                raise
    
    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """
        Split text into chunks with overlap
        
        Args:
            text: Text to chunk
            chunk_size: Size of each chunk
            overlap: Overlap between chunks
        
        Returns:
            List of text chunks
        """
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunk = text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks
    
    def build_index(self, papers: List[Dict[str, Any]]) -> None:
        """
        Build RAG index from papers
        
        Args:
            papers: List of paper dictionaries
        """
        self._ensure_model_loaded()  # Load model if not already loaded
        
        self.chunks = []
        
        for paper in papers:
            # Combine title and summary for indexing
            content = f"Title: {paper['title']}\n\nSummary: {paper['summary']}"
            
            # Chunk the content
            paper_chunks = self.chunk_text(content)
            
            for chunk in paper_chunks:
                self.chunks.append({
                    "text": chunk,
                    "paper": {
                        "title": paper["title"],
                        "authors": paper.get("authors", []),
                        "url": paper.get("url", ""),
                        "source": paper.get("source", "Unknown")
                    }
                })
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(self.chunks)} chunks")
        texts = [chunk["text"] for chunk in self.chunks]
        self.embeddings = self.embedding_model.encode(texts, convert_to_tensor=True)
        
        logger.info("RAG index built successfully")
    
    def retrieve(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """
        Retrieve relevant chunks for a query
        
        Args:
            query: Query string
            top_k: Number of top results
        
        Returns:
            List of relevant chunks with metadata
        """
        self._ensure_model_loaded()  # Load model if not already loaded
        
        top_k = top_k or settings.TOP_K_CHUNKS
        
        if not self.chunks:
            logger.warning("RAG index is empty")
            return []
        
        # Encode query
        query_embedding = self.embedding_model.encode(query, convert_to_tensor=True)
        
        # Calculate similarities
        similarities = query_embedding @ self.embeddings.T
        similarities = similarities.cpu().numpy()
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Retrieve and return results
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.0:  # Only include positive similarities
                results.append({
                    "text": self.chunks[idx]["text"],
                    "paper": self.chunks[idx]["paper"],
                    "relevance_score": float(similarities[idx])
                })
        
        return results