"""Embedding model management with lazy loading"""

from typing import List, Union
import numpy as np
from utils.logger import get_logger
from config import get_settings

logger = get_logger(__name__)
settings = get_settings()


class EmbeddingModel:
    """Wrapper for sentence-transformers embedding model with lazy loading"""
    
    def __init__(self, model_name: str = None):
        """
        Initialize embedding model (no actual loading yet)
        
        Args:
            model_name: Name of the model (defaults to config)
        """
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.model = None  # Will be loaded on first use
        self.embedding_dim = None
        logger.info(f"EmbeddingModel initialized (lazy loading): {self.model_name}")
    
    def _ensure_loaded(self):
        """Load model on first use"""
        if self.model is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
                self.embedding_dim = self.model.get_sentence_embedding_dimension()
                logger.info(f"Model loaded. Embedding dimension: {self.embedding_dim}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {str(e)}")
                raise
    
    def encode(self, texts: Union[str, List[str]], convert_to_tensor: bool = False):
        """
        Encode text(s) to embeddings
        
        Args:
            texts: Single text or list of texts
            convert_to_tensor: Return as tensor (True) or numpy (False)
            
        Returns:
            Embeddings as numpy array or tensor
        """
        self._ensure_loaded()  # Load if not already loaded
        
        try:
            if isinstance(texts, str):
                texts = [texts]
            
            embeddings = self.model.encode(texts, convert_to_tensor=convert_to_tensor)
            return embeddings
            
        except Exception as e:
            logger.error(f"Error encoding texts: {str(e)}")
            raise
    
    def similarity(self, embedding1, embedding2):
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score (0-1)
        """
        try:
            # Handle tensor or numpy arrays
            if hasattr(embedding1, 'cpu'):
                embedding1 = embedding1.cpu().numpy()
            if hasattr(embedding2, 'cpu'):
                embedding2 = embedding2.cpu().numpy()
            
            # Normalize
            emb1_norm = embedding1 / np.linalg.norm(embedding1)
            emb2_norm = embedding2 / np.linalg.norm(embedding2)
            
            # Cosine similarity
            similarity = np.dot(emb1_norm, emb2_norm.T)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return 0.0
    
    def get_model_info(self) -> dict:
        """Get information about the model"""
        self._ensure_loaded()
        return {
            "model_name": self.model_name,
            "embedding_dimension": self.embedding_dim,
            "model_type": "sentence-transformers"
        }