"""
Configuration for AI Service
Loads environment variables for API keys and service settings
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# --------------------------------------------------
# Hugging Face API Configuration
# --------------------------------------------------

HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise ValueError("HF_API_KEY environment variable must be set")

# --------------------------------------------------
# AI Service Configuration
# --------------------------------------------------

AI_SERVICE_HOST = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))

# --------------------------------------------------
# Node.js Backend Configuration
# --------------------------------------------------

# Used by AI service to fetch volunteers / NGOs
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

# --------------------------------------------------
# MODEL CONFIGURATION (REAL, WORKING MODELS)
# --------------------------------------------------

# ✅ Router-supported vision model (STABLE)
FOOD_SAFETY_MODEL = os.getenv(
    "FOOD_SAFETY_MODEL",
    "openai/clip-vit-base-patch32"
)



# LLM model (used for reasoning / ticket / matching)
LLM_MODEL = os.getenv("LLM_MODEL", "google/flan-t5-large")


# --------------------------------------------------
# LOGGING CONFIGURATION
# --------------------------------------------------

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "ai_service.log")

# --------------------------------------------------
# GEOSPATIAL & MATCHING CONFIGURATION
# --------------------------------------------------

DEFAULT_MAX_DISTANCE_KM = float(
    os.getenv("DEFAULT_MAX_DISTANCE_KM", "50.0")
)

# --------------------------------------------------
# FOOD SAFETY THRESHOLDS
# --------------------------------------------------

MIN_SAFETY_CONFIDENCE = float(
    os.getenv("MIN_SAFETY_CONFIDENCE", "0.7")
)

URGENCY_THRESHOLD_HIGH = int(
    os.getenv("URGENCY_THRESHOLD_HIGH", "2")
)  # hours

URGENCY_THRESHOLD_MEDIUM = int(
    os.getenv("URGENCY_THRESHOLD_MEDIUM", "6")
)  # hours
