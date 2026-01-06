import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

print("Checking FAISS Index Contents...")
print(f"Index path: {settings.get_index_path()}")

embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)

# Get all documents
docs = list(db.docstore._dict.values())
print(f"\nTotal documents in index: {len(docs)}")

# Count by source
pdf_count = 0
json_count = 0
txt_count = 0

for doc in docs:
    source = doc.metadata.get('source', '')
    if source == 'pdf':
        pdf_count += 1
    elif source == 'json':
        json_count += 1
    else:
        txt_count += 1

print(f"\nPDF documents: {pdf_count}")
print(f"JSON documents: {json_count}")
print(f"TXT documents: {txt_count}")

# Show first PDF doc if exists
pdf_docs = [d for d in docs if d.metadata.get('source') == 'pdf']
if pdf_docs:
    print(f"\nFirst PDF document metadata: {pdf_docs[0].metadata}")
    print(f"Content length: {len(pdf_docs[0].page_content)}")
    print(f"First 100 chars: {pdf_docs[0].page_content[:100]}")
else:
    print("\nNO PDF DOCUMENTS IN INDEX - This is the problem!")
