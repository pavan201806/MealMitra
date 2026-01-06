"""
Test script to verify PDF reading functionality
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.config import settings
from backend.ingest import load_pdfs
from backend.rag_agent import get_answer
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

print("=" * 60)
print("PDF READING VERIFICATION TEST")
print("=" * 60)

# Test 1: Check PDF directory
print("\n1. Checking PDF directory...")
print(f"   PDF Directory: {settings.PDF_DIR}")
print(f"   Exists: {settings.PDF_DIR.exists()}")

if settings.PDF_DIR.exists():
    pdf_files = [f for f in os.listdir(settings.PDF_DIR) if f.lower().endswith('.pdf')]
    print(f"   PDF files found: {pdf_files}")
else:
    print("   ERROR: PDF directory does not exist!")
    sys.exit(1)

# Test 2: Test PDF extraction
print("\n2. Testing PDF extraction...")
pdf_docs = load_pdfs()
print(f"   SUCCESS: Extracted {len(pdf_docs)} PDF documents")

if pdf_docs:
    for i, doc in enumerate(pdf_docs[:3], 1):
        print(f"   Doc {i}: {doc.metadata.get('file')} - Page {doc.metadata.get('page')} - {len(doc.page_content)} chars")
        print(f"      Method: {doc.metadata.get('extraction_method')}")
        print(f"      Preview: {doc.page_content[:100]}...")
else:
    print("   ❌ No PDF documents extracted!")

# Test 3: Check index
print("\n3. Checking FAISS index...")
embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
try:
    db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)
    all_docs = list(db.docstore._dict.values())
    pdf_docs_in_index = [d for d in all_docs if d.metadata.get('source') == 'pdf']
    print(f"   SUCCESS: Index loaded successfully")
    print(f"   Total documents in index: {len(all_docs)}")
    print(f"   PDF documents in index: {len(pdf_docs_in_index)}")
    
    if pdf_docs_in_index:
        print(f"   SUCCESS: PDFs are in the index!")
        print(f"   Sample PDF: {pdf_docs_in_index[0].metadata.get('file')}")
    else:
        print("   ERROR: No PDFs found in index - run 'python backend/ingest.py' to rebuild")
except Exception as e:
    print(f"   ERROR: Error loading index: {e}")
    print("   Run 'python backend/ingest.py' to create the index")

# Test 4: Test RAG query (if index exists)
print("\n4. Testing RAG query with PDF content...")
try:
    # Try a generic query
    result = get_answer("What information is in the PDF?")
    print(f"   SUCCESS: RAG query successful")
    print(f"   Answer preview: {result[:150]}...")
except Exception as e:
    print(f"   WARNING: RAG query failed: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)

