import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

print("Checking FAISS Index Contents...")
embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)

# Get all documents
docs = list(db.docstore._dict.values())
print(f"Total documents in index: {len(docs)}\n")

# Show all unique sources
sources = {}
for doc in docs:
    source = doc.metadata.get('source', 'unknown')
    sources[source] = sources.get(source, 0) + 1

print("Documents by source:")
for source, count in sources.items():
    print(f"  {source}: {count}")

# Look for PDF-related documents
print("\n" + "="*60)
print("Looking for PDF documents...")
print("="*60)

pdf_docs = [d for d in docs if 'pdf' in str(d.metadata.get('source', '')).lower() or 
            'pdf' in str(d.metadata.get('file', '')).lower() or
            d.metadata.get('extraction_method') in ['native', 'ocr']]

if pdf_docs:
    print(f"\n✅ Found {len(pdf_docs)} PDF-related documents!")
    print(f"\nFirst PDF document:")
    print(f"  Metadata: {pdf_docs[0].metadata}")
    print(f"  Content length: {len(pdf_docs[0].page_content)}")
    print(f"  First 200 chars: {pdf_docs[0].page_content[:200]}")
    
    # Check for caffeine
    caffeine_docs = [d for d in pdf_docs if 'caffeine' in d.page_content.lower()]
    if caffeine_docs:
        print(f"\n✅ Found {len(caffeine_docs)} documents mentioning caffeine!")
else:
    print("\n❌ No PDF documents found")
