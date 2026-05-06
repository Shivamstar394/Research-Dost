# FILE 2: backend/agents/base_agent.py
"""Base agent class providing common functionality"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from utils.logger import get_logger

logger = get_logger(__name__)


class BaseAgent(ABC):
    """Abstract base class for all agents"""
    
    def __init__(self, name: str):
        """
        Initialize base agent
        
        Args:
            name: Agent name for logging
        """
        self.name = name
        self.logger = get_logger(name)
        self.logger.info(f"Initializing {self.name}")
    
    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Execute agent task
        
        This method must be implemented by subclasses
        """
        pass
    
    def log_step(self, step: str, details: str = "") -> None:
        """Log a processing step"""
        self.logger.info(f"[{self.name}] {step}: {details}")
    
    def log_error(self, error: str) -> None:
        """Log an error"""
        self.logger.error(f"[{self.name}] {error}")
    
    def validate_input(self, input_data: Dict[str, Any], required_keys: List[str]) -> bool:
        """
        Validate input has required keys
        
        Args:
            input_data: Input dictionary
            required_keys: List of required keys
            
        Returns:
            True if valid, False otherwise
        """
        for key in required_keys:
            if key not in input_data or not input_data[key]:
                self.log_error(f"Missing required key: {key}")
                return False
        return True