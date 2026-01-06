# Deployment Refactoring Summary

## Overview
This document summarizes the refactoring performed to make the RAG backend production-ready for cloud deployment (Render, Railway, Fly.io).

## Issues Found and Fixed

### Category A: Must-Change for Deployment (Would Break in Production)

#### 1. Hardcoded Windows File Paths
**Files Affected:**
- `backend/ingest.py` (lines 115-117)
- `backend/rag_agent.py` (line 12)

**Issue:**
```python
DATA_DIR = r"c:\RAG\data"
ROOT_DIR = r"c:\RAG"
INDEX_PATH = r"c:\RAG\backend\faiss_index"
```

**Why it breaks:**
- Windows-specific absolute paths won't exist on Linux-based cloud platforms
- Hardcoded paths prevent deployment flexibility
- Different environments have different directory structures

**Fix:**
- Created centralized `backend/config.py` with environment-variable-driven paths
- All paths now use `Path` objects with relative defaults
- Paths auto-resolve from project root or can be overridden via env vars

#### 2. Hardcoded Tesseract OCR Path
**File:** `backend/ingest.py` (line 104)

**Issue:**
```python
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

**Why it breaks:**
- Windows-specific path won't work on Linux/macOS
- Tesseract may not be installed in production
- Breaks cross-platform compatibility

**Fix:**
- Made OCR optional via `ENABLE_OCR` environment variable
- Auto-detection of Tesseract in common locations (Windows, Linux, macOS)
- Configurable via `TESSERACT_CMD` environment variable
- Graceful fallback if OCR unavailable

#### 3. Hardcoded Server Configuration
**File:** `backend/app.py` (lines 20-21)

**Issue:**
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

**Why it breaks:**
- Debug mode should never be enabled in production (security risk)
- Port should be configurable (cloud platforms set PORT env var)
- Host configuration should be flexible

**Fix:**
- Port, host, and debug mode now from environment variables
- Defaults: `HOST=0.0.0.0`, `PORT=5000`, `DEBUG=false`
- Cloud platforms can override PORT via their environment

### Category B: Should-Change (Bad Practice, Not Fatal)

#### 1. Hardcoded Model Names
**Files:**
- `backend/rag_agent.py` (lines 17, 20)

**Issue:**
```python
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
```

**Why it's bad:**
- No flexibility to switch models without code changes
- Can't A/B test different models
- Harder to optimize costs

**Fix:**
- Model names now configurable via `OPENAI_MODEL` and `EMBEDDING_MODEL`
- Temperature configurable via `OPENAI_TEMPERATURE`
- Safe defaults provided

#### 2. Hardcoded RAG Parameters
**Files:**
- `backend/ingest.py` (line 240)
- `backend/rag_agent.py` (line 66)

**Issue:**
```python
chunk_size=1000, chunk_overlap=200
k=4  # retrieval count
```

**Fix:**
- All parameters now configurable via environment variables
- `CHUNK_SIZE`, `CHUNK_OVERLAP`, `RETRIEVAL_K`

### Category C: Optional Improvements (Implemented)

1. **Centralized Configuration**: Created `backend/config.py` with validation
2. **Health Check Endpoint**: Added `/health` for deployment platform monitoring
3. **Better Error Messages**: Improved logging and error handling
4. **Configuration Validation**: Startup validation prevents misconfiguration

## Files Created

### `backend/config.py`
Centralized configuration module that:
- Loads all settings from environment variables
- Provides safe defaults for all values
- Validates critical settings on startup
- Supports cross-platform path resolution
- Auto-detects Tesseract OCR location

### `.env.example`
Template file with:
- All available environment variables
- Documentation for each variable
- Production-safe defaults
- Clear categorization

## Files Modified

### `backend/app.py`
- Removed hardcoded port and debug mode
- Added configuration import and validation
- Added `/health` endpoint for deployment platforms
- Uses `settings.HOST`, `settings.PORT`, `settings.DEBUG`

### `backend/ingest.py`
- Removed all hardcoded Windows paths
- Made OCR optional and configurable
- Uses `settings` for all paths and parameters
- Improved error handling for missing OCR

### `backend/rag_agent.py`
- Removed hardcoded index path
- Uses `settings` for model names and parameters
- Improved error messages for missing index
- Uses configurable retrieval count

### `README.md`
- Added comprehensive "Deployment Configuration" section
- Documented all environment variables
- Added deployment platform-specific instructions
- Included troubleshooting guide

## Environment Variables

### Required
- `OPENAI_API_KEY`: OpenAI API key (required)

### Server Configuration
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `5000`)
- `DEBUG`: Debug mode (default: `false`)
- `ENVIRONMENT`: `development` or `production` (default: `production`)

### Path Configuration
- `PROJECT_ROOT`: Project root directory (auto-detected)
- `DATA_DIR`: Data directory (default: `./data`)
- `INDEX_DIR`: FAISS index directory (default: `./backend/faiss_index`)

### LLM Configuration
- `OPENAI_MODEL`: Model name (default: `gpt-4o-mini`)
- `OPENAI_TEMPERATURE`: Temperature (default: `0`)

### Embedding Configuration
- `EMBEDDING_MODEL`: Embedding model (default: `all-MiniLM-L6-v2`)

### RAG Configuration
- `CHUNK_SIZE`: Chunk size (default: `1000`)
- `CHUNK_OVERLAP`: Chunk overlap (default: `200`)
- `RETRIEVAL_K`: Retrieval count (default: `4`)

### OCR Configuration
- `ENABLE_OCR`: Enable OCR (default: `true`)
- `TESSERACT_CMD`: Tesseract path (auto-detected)

## Verification

### ✅ All Hardcoded Paths Removed
- No active hardcoded Windows paths
- No active hardcoded localhost URLs
- All paths use configuration

### ✅ Production-Ready
- Debug mode defaults to `false`
- Host defaults to `0.0.0.0` (accepts external connections)
- Port is configurable
- Health check endpoint available

### ✅ Cross-Platform Compatible
- Path resolution works on Windows, Linux, macOS
- OCR auto-detection works across platforms
- No platform-specific assumptions

### ✅ Cloud Deployment Ready
- Works with Render, Railway, Fly.io
- Respects platform PORT environment variable
- Handles missing files gracefully
- Configuration validation on startup

## Deployment Checklist

- [x] All hardcoded paths removed
- [x] Environment variables configured
- [x] Health check endpoint added
- [x] Configuration validation implemented
- [x] Documentation updated
- [x] `.env.example` created
- [x] Cross-platform compatibility verified
- [x] Production defaults set

## Next Steps for Production

1. **Persistent Storage**: Configure volumes for `INDEX_DIR` and `DATA_DIR`
2. **CORS Configuration**: Update CORS to allow only frontend domain
3. **Cloud Storage**: Implement S3/GCS adapters for scale (future)
4. **Monitoring**: Add logging and metrics
5. **Secrets Management**: Use platform secrets for API keys

## Testing

To verify the refactoring:

```bash
# 1. Set environment variables
export OPENAI_API_KEY=your_key
export DEBUG=false
export ENVIRONMENT=production

# 2. Test configuration loading
python -c "from backend.config import settings; settings.validate(); print('✅ Config OK')"

# 3. Test ingestion (if data available)
python backend/ingest.py

# 4. Test server startup
python backend/app.py

# 5. Test health endpoint
curl http://localhost:5000/health
```

## Notes

- Commented-out code in `ingest.py` (lines 1-97) contains old hardcoded paths but is inactive
- Tesseract OCR paths in `config.py` are for auto-detection only, not hardcoded usage
- All active code paths use configuration
- The application will boot without local files (with warnings)
- RAG pipeline works in production mode with proper configuration

