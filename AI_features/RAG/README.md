# RAG-based Chatbot Application

This is a full-stack RAG (Retrieval-Augmented Generation) chatbot. It uses a Flask backend for document processing and React for the frontend.

## Folder Structure

```text
/RAG
├── /backend
│   ├── app.py               # Flask server
│   ├── config.py            # Centralized configuration
│   ├── rag_agent.py         # RAG logic & document loading
│   ├── ingest.py            # Document ingestion script
│   ├── requirements.txt     # Python dependencies
│   └── /faiss_index         # Vector store index (generated)
├── /data
│   ├── /pdfs                # PDF documents
│   └── /text_files          # Text documents
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── ChatWidget.jsx
│   │   │   └── ChatWidget.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json         # React dependencies
├── .env.example             # Environment variables template
└── README.md
```

## Setup Instructions

### Backend Setup

1. **Navigate to project root**: `cd RAG`
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Edit `.env` and set your `OPENAI_API_KEY` (required)
   - Adjust other settings as needed (see Configuration section below)
4. **Add Data**: Place your `.pdf`, `.txt`, and `.json` documents:
   - PDFs: `data/pdfs/`
   - Text files: `data/text_files/`
   - JSON: `books.json` in project root
5. **Ingest Documents** (first time only):
   ```bash
   python backend/ingest.py
   ```
   This creates the FAISS vector index from your documents.
6. **Run the server**:
   ```bash
   python backend/app.py
   ```
   The server will start on the configured host/port (default: `0.0.0.0:5000`).

### Frontend Setup

1. **Navigate to frontend folder**: `cd frontend`
2. **Install dependencies**: `npm install`
3. **Run the app**: `npm start`
   - The app will start at `http://localhost:3000`.

## Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

### Required Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

### Key Configuration Options

- `HOST`: Server host (default: `0.0.0.0` for production)
- `PORT`: Server port (default: `5000`)
- `DEBUG`: Enable debug mode (default: `false`)
- `ENVIRONMENT`: `development` or `production` (default: `production`)
- `DATA_DIR`: Path to data directory (default: `./data`)
- `INDEX_DIR`: Path to FAISS index (default: `./backend/faiss_index`)
- `OPENAI_MODEL`: OpenAI model name (default: `gpt-4o-mini`)
- `EMBEDDING_MODEL`: Embedding model (default: `all-MiniLM-L6-v2`)
- `ENABLE_OCR`: Enable OCR for scanned PDFs (default: `true`)
- `TESSERACT_CMD`: Path to Tesseract OCR (auto-detected if not set)

## Deployment Configuration

### Production Deployment (Render / Railway / Fly.io)

The application is configured for cloud deployment with the following considerations:

#### 1. Environment Variables

Set these in your platform's environment variable settings:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Server (platforms usually set PORT automatically)
HOST=0.0.0.0
PORT=5000  # Or use platform's PORT env var

# Production settings
DEBUG=false
ENVIRONMENT=production

# Paths (use absolute paths or relative to working directory)
# Most platforms use the project root as working directory
DATA_DIR=./data
INDEX_DIR=./backend/faiss_index
```

#### 2. Build and Start Commands

**Render:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python backend/app.py`

**Railway:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python backend/app.py`

**Fly.io:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python backend/app.py`

#### 3. Persistent Storage

**Important**: The FAISS index and data files need persistent storage.

**Option A: Ephemeral Storage (Development)**
- Index is regenerated on each deployment
- Run `python backend/ingest.py` as part of build process
- Not recommended for production

**Option B: Persistent Volumes (Production)**
- Use platform's volume/storage features:
  - **Render**: Persistent Disk (add to service)
  - **Railway**: Volumes (create volume for `backend/faiss_index`)
  - **Fly.io**: Volumes (create volume and mount)
- Mount volumes to `INDEX_DIR` and `DATA_DIR`

**Option C: Cloud Storage (Recommended for Scale)**
- Store index and data in S3/GCS/Azure Blob
- Implement storage adapters in `config.py` (future enhancement)
- Set `STORAGE_TYPE=s3` and configure bucket/credentials

#### 4. OCR Configuration

For production, OCR (Tesseract) may not be available. Options:

- **Disable OCR**: Set `ENABLE_OCR=false` in environment
- **Install Tesseract**: Add to build process (platform-specific)
- **Use Cloud OCR**: Implement cloud OCR service (future enhancement)

#### 5. Health Check Endpoint

Add to `backend/app.py` for platform health checks:

```python
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200
```

#### 6. CORS Configuration

For production, configure CORS to allow only your frontend domain:

```python
from flask_cors import CORS

# In app.py, replace CORS(app) with:
CORS(app, origins=["https://your-frontend-domain.com"])
```

#### 7. Example Deployment Checklist

- [ ] Set `OPENAI_API_KEY` in platform environment
- [ ] Set `DEBUG=false` and `ENVIRONMENT=production`
- [ ] Configure persistent storage for index/data
- [ ] Set up CORS for frontend domain
- [ ] Test health endpoint
- [ ] Verify index loads on startup
- [ ] Monitor logs for configuration errors

### Local Development

For local development, create a `.env` file:

```bash
OPENAI_API_KEY=your_key_here
DEBUG=true
ENVIRONMENT=development
HOST=127.0.0.1
PORT=5000
```

## How to Use

1. **Start Backend**: Run `python backend/app.py`
2. **Start Frontend**: Run `npm start` in `frontend/` directory
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Chat**: Click the floating chat icon and ask questions based on your ingested documents

## Troubleshooting

### Index Not Found
- Run `python backend/ingest.py` to create the index
- Check that `INDEX_DIR` path is correct
- Verify index files exist: `backend/faiss_index/index.faiss` and `index.pkl`

### OCR Not Working
- Install Tesseract OCR on your system
- Set `TESSERACT_CMD` to the correct path
- Or set `ENABLE_OCR=false` to disable OCR

### Configuration Errors
- Ensure `.env` file exists and contains required variables
- Check that paths are correct (absolute or relative to project root)
- Verify `OPENAI_API_KEY` is set correctly
