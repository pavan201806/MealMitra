"""
HuggingFace Client Service
Handles all interactions with HuggingFace Inference API
Uses environment variable HF_API_KEY for authentication
"""

import requests
from typing import Dict, Any, Optional
import logging

from config import HF_API_KEY

logger = logging.getLogger(__name__)


class HuggingFaceClient:
    """
    Client for interacting with HuggingFace Inference API
    Uses HuggingFace Router endpoint
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or HF_API_KEY
        if not self.api_key:
            raise ValueError("HF_API_KEY must be provided")

        # ✅ Official Hugging Face Router endpoint
        self.base_url = "https://router.huggingface.co/hf-inference/models"

        self.auth_header = {
            "Authorization": f"Bearer {self.api_key}"
        }

    # --------------------------------------------------
    # TEXT GENERATION (LLM — JSON)
    # --------------------------------------------------

    def text_generation(
        self,
        model: str,
        prompt: str,
        max_length: int = 512,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate text using HuggingFace LLM
        """

        url = f"{self.base_url}/{model}"

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_length,
                "temperature": temperature,
                "return_full_text": False
            }
        }

        response = requests.post(
            url,
            headers={**self.auth_header, "Content-Type": "application/json"},
            json=payload,
            timeout=60
        )

        if response.status_code == 503:
            logger.warning("LLM loading, retrying...")
            import time
            time.sleep(10)
            response = requests.post(
                url,
                headers={**self.auth_header, "Content-Type": "application/json"},
                json=payload,
                timeout=60
            )

        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and result and "generated_text" in result[0]:
            return {"generated_text": result[0]["generated_text"]}

        return {"generated_text": str(result)}

    # --------------------------------------------------
    # ZERO-SHOT CLASSIFICATION (JSON)
    # --------------------------------------------------

    def zero_shot_classification(
        self,
        model: str,
        text: str,
        candidate_labels: list
    ) -> Dict[str, Any]:
        """
        Zero-shot classification using HuggingFace
        """

        url = f"{self.base_url}/{model}"

        payload = {
            "inputs": text,
            "parameters": {
                "candidate_labels": candidate_labels
            }
        }

        response = requests.post(
            url,
            headers={**self.auth_header, "Content-Type": "application/json"},
            json=payload,
            timeout=30
        )

        if response.status_code == 503:
            logger.warning("Zero-shot model loading, retrying...")
            import time
            time.sleep(5)
            response = requests.post(
                url,
                headers={**self.auth_header, "Content-Type": "application/json"},
                json=payload,
                timeout=30
            )

        response.raise_for_status()
        return response.json()
