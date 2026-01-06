# """
# Centralized configuration module for RAG backend.
# All environment-specific values are loaded from environment variables with safe defaults.
# """
# import os
# from pathlib import Path
# from typing import Optional
# from dotenv import load_dotenv

# # Load environment variables from .env file if present
# load_dotenv()


# class Settings:
#     """Application settings loaded from environment variables."""
    
#     # Server Configuration
#     HOST: str = os.getenv("HOST", "0.0.0.0")
#     PORT: int = int(os.getenv("PORT", "5000"))
#     DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
#     ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
#     # Paths Configuration
#     # Use relative paths from project root by default, but allow override via env vars
#     PROJECT_ROOT: Path = Path(os.getenv("PROJECT_ROOT", os.path.dirname(os.path.dirname(__file__)))).resolve()
#     DATA_DIR: Path = Path(os.getenv("DATA_DIR", PROJECT_ROOT / "data")).resolve()
#     INDEX_DIR: Path = Path(os.getenv("INDEX_DIR", PROJECT_ROOT / "backend" / "faiss_index")).resolve()
    
#     # Data subdirectories
#     PDF_DIR: Path = DATA_DIR / "pdfs"
#     TEXT_DIR: Path = DATA_DIR / "text_files"
#     JSON_FILE: Path = PROJECT_ROOT / "books.json"
    
#     # OCR Configuration (optional, for production OCR services)
#     TESSERACT_CMD: Optional[str] = os.getenv("TESSERACT_CMD")
#     ENABLE_OCR: bool = os.getenv("ENABLE_OCR", "true").lower() in ("true", "1", "yes")
    
#     # LLM Configuration
#     OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
#     OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
#     OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0"))
    
#     # Embedding Configuration
#     EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
#     # RAG Configuration
#     CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "300"))
#     CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))
#     RETRIEVAL_K: int = int(os.getenv("RETRIEVAL_K", "12"))
    
#     # Storage Configuration (for future cloud storage support)
#     STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # local, s3, gcs, etc.
#     STORAGE_BUCKET: Optional[str] = os.getenv("STORAGE_BUCKET")
#     STORAGE_PREFIX: Optional[str] = os.getenv("STORAGE_PREFIX")
    
#     @classmethod
#     def validate(cls) -> None:
#         """Validate critical settings."""
#         if not cls.OPENAI_API_KEY:
#             raise ValueError("OPENAI_API_KEY environment variable is required")
        
#         # Ensure directories exist or can be created
#         cls.INDEX_DIR.mkdir(parents=True, exist_ok=True)
#         cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
#         cls.PDF_DIR.mkdir(parents=True, exist_ok=True)
#         cls.TEXT_DIR.mkdir(parents=True, exist_ok=True)
    
#     @classmethod
#     def get_index_path(cls) -> str:
#         """Get the FAISS index directory path as string."""
#         return str(cls.INDEX_DIR)
    
#     @classmethod
#     def is_production(cls) -> bool:
#         """Check if running in production environment."""
#         return cls.ENVIRONMENT.lower() == "production"
    
#     @classmethod
#     def get_tesseract_cmd(cls) -> Optional[str]:
#         """Get Tesseract command path if configured, otherwise try to auto-detect."""
#         if cls.TESSERACT_CMD:
#             return cls.TESSERACT_CMD
        
#         # Auto-detect common installation paths (cross-platform)
#         if not cls.ENABLE_OCR:
#             return None
            
#         # Try common paths
#         common_paths = [
#             r"C:\Program Files\Tesseract-OCR\tesseract.exe",  # Windows default
#             r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",  # Windows 32-bit
#             "/usr/bin/tesseract",  # Linux
#             "/usr/local/bin/tesseract",  # macOS/Linux
#             "tesseract",  # In PATH
#         ]
        
#         import shutil
#         for path in common_paths:
#             if path == "tesseract":
#                 # Check if tesseract is in PATH
#                 if shutil.which("tesseract"):
#                     return "tesseract"
#             elif os.path.exists(path):
#                 return path
        
#         return None


# # Global settings instance
# settings = Settings()

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    POPPLER_PATH = os.getenv(
    "POPPLER_PATH",
    r"C:\Users\pavan\Downloads\Release-23.08.0-0\poppler-23.08.0\Library\bin"
)

    DATA_DIR = PROJECT_ROOT / "data"

    PDF_DIR = DATA_DIR / "pdfs"
    TEXT_DIR = DATA_DIR / "text_files"
    JSON_DIR = DATA_DIR / "json"

    INDEX_DIR = Path(__file__).resolve().parent / "faiss_index"

    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    CHUNK_SIZE = 300
    CHUNK_OVERLAP = 100
    RETRIEVAL_K = 4

    ENABLE_OCR = os.getenv("ENABLE_OCR", "true").lower() == "true"
    TESSERACT_CMD = os.getenv("TESSERACT_CMD")

    @classmethod
    def get_index_path(cls):
        cls.INDEX_DIR.mkdir(parents=True, exist_ok=True)
        return str(cls.INDEX_DIR)

settings = Settings()
