"""
Diagnostic script to check PDF extraction and indexing
"""
import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("=" * 60)
print("PDF EXTRACTION DIAGNOSTIC")
print("=" * 60)

# Check 1: PDF Directory
print(f"\n1. PDF Directory: {settings.PDF_DIR}")
print(f"   Exists: {settings.PDF_DIR.exists()}")
if settings.PDF_DIR.exists():
    pdf_files = [f for f in os.listdir(settings.PDF_DIR) if f.lower().endswith('.pdf')]
    print(f"   PDF Files found: {pdf_files}")
else:
    print("   ❌ PDF directory not found!")

# Check 2: OCR Configuration
print(f"\n2. OCR Configuration:")
print(f"   ENABLE_OCR: {settings.ENABLE_OCR}")
print(f"   TESSERACT_CMD: {settings.TESSERACT_CMD}")
print(f"   POPPLER_PATH: {settings.POPPLER_PATH}")

# Check 3: Test OCR on PDF
print(f"\n3. Testing PDF Extraction:")
if settings.PDF_DIR.exists() and pdf_files:
    try:
        import pytesseract
        from pdf2image import convert_from_path
        
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        
        test_pdf = settings.PDF_DIR / pdf_files[0]
        print(f"   Testing: {test_pdf}")
        
        # Try to convert first page
        images = convert_from_path(
            test_pdf,
            dpi=300,
            first_page=1,
            last_page=1,
            poppler_path=settings.POPPLER_PATH
        )
        
        if images:
            print(f"   ✅ Successfully converted PDF to image")
            
            # Try OCR
            text = pytesseract.image_to_string(images[0], config="--psm 4 -l eng")
            print(f"   ✅ OCR extracted {len(text)} characters")
            print(f"   First 200 chars: {text[:200]}")
        else:
            print(f"   ❌ Failed to convert PDF to images")
            
    except Exception as e:
        print(f"   ❌ Error during PDF extraction: {e}")
        import traceback
        traceback.print_exc()

# Check 4: FAISS Index Contents
print(f"\n4. FAISS Index Analysis:")
index_path = settings.get_index_path()
print(f"   Index path: {index_path}")

if os.path.exists(index_path):
    try:
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        db = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        
        # Get all documents
        print(f"   ✅ Index loaded successfully")
        
        # Try to access the docstore
        if hasattr(db, 'docstore'):
            docs = list(db.docstore._dict.values())
            print(f"   Total documents in index: {len(docs)}")
            
            # Count by source type
            sources = {}
            for doc in docs:
                source = doc.metadata.get('source', 'unknown')
                if 'pdf' in str(source).lower() or doc.metadata.get('file', '').endswith('.pdf'):
                    source_type = 'PDF'
                elif source == 'json' or 'json' in str(source).lower():
                    source_type = 'JSON'
                elif source.endswith('.txt'):
                    source_type = 'TXT'
                else:
                    source_type = 'OTHER'
                
                sources[source_type] = sources.get(source_type, 0) + 1
            
            print(f"\n   Documents by source type:")
            for source_type, count in sources.items():
                print(f"     {source_type}: {count}")
            
            # Show sample PDF documents
            pdf_docs = [d for d in docs if d.metadata.get('source') == 'pdf' or 
                       d.metadata.get('file', '').endswith('.pdf')]
            
            if pdf_docs:
                print(f"\n   Sample PDF document:")
                sample = pdf_docs[0]
                print(f"     Metadata: {sample.metadata}")
                print(f"     Content length: {len(sample.page_content)}")
                print(f"     First 200 chars: {sample.page_content[:200]}")
            else:
                print(f"\n   ❌ NO PDF DOCUMENTS FOUND IN INDEX!")
                print(f"   This is the problem - PDFs were not indexed.")
                
    except Exception as e:
        print(f"   ❌ Error loading index: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"   ❌ Index not found!")

print("\n" + "=" * 60)
print("DIAGNOSIS COMPLETE")
print("=" * 60)
