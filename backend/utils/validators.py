# FILE 6: backend/utils/validators.py
"""Input validation utilities"""

import re
from typing import Tuple, List
from utils.logger import get_logger

logger = get_logger(__name__)


def validate_query(query: str, min_length: int = 1, max_length: int = 500) -> Tuple[bool, str]:
    """
    Validate research query
    
    Args:
        query: Query string to validate
        min_length: Minimum query length
        max_length: Maximum query length
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    query = query.strip()
    
    if not query:
        return False, "Query cannot be empty"
    
    if len(query) < min_length:
        return False, f"Query must be at least {min_length} characters"
    
    if len(query) > max_length:
        return False, f"Query cannot exceed {max_length} characters"
    
    # Check for valid characters
    if not re.match(r"^[a-zA-Z0-9\s\-\+\&\.\(\)\'\"]+$", query):
        return False, "Query contains invalid characters"
    
    logger.info(f"Query validation passed: {query[:50]}...")
    return True, ""


def validate_sources(sources: List[str]) -> Tuple[bool, str]:
    """
    Validate paper sources
    
    Args:
        sources: List of source names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_sources = {"arxiv", "pubmed", "crossref", "doaj", "ssrn", "springer", "ieee_xplore"}
    
    if not sources:
        return False, "At least one source must be selected"
    
    if not isinstance(sources, list):
        return False, "Sources must be a list"
    
    for source in sources:
        if source not in valid_sources:
            return False, f"Invalid source: {source}. Valid sources: {valid_sources}"
    
    logger.info(f"Sources validation passed: {sources}")
    return True, ""


def validate_api_key(api_key: str) -> Tuple[bool, str]:
    """
    Validate API key format
    
    Args:
        api_key: API key to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not api_key:
        return False, "API key is not configured"
    
    if len(api_key) < 10:
        return False, "API key appears invalid"
    
    return True, ""
