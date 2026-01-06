import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

with open("index_check_results.txt", "w", encoding="utf-8") as f:
    f.write("=" * 60 + "\n")
    f.write("FAISS INDEX VERIFICATION\n")
    f.write("=" * 60 + "\n\n")
    
    f.write(f"Index path: {settings.get_index_path()}\n\n")
    
    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)
    
    # Get all documents
    docs = list(db.docstore._dict.values())
    f.write(f"Total documents in index: {len(docs)}\n\n")
    
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
    
    f.write(f"PDF documents: {pdf_count}\n")
    f.write(f"JSON documents: {json_count}\n")
    f.write(f"TXT documents: {txt_count}\n\n")
    
    # Show first PDF doc if exists
    pdf_docs = [d for d in docs if d.metadata.get('source') == 'pdf']
    if pdf_docs:
        f.write("SUCCESS! PDF documents found in index!\n\n")
        f.write(f"First PDF document metadata: {pdf_docs[0].metadata}\n")
        f.write(f"Content length: {len(pdf_docs[0].page_content)}\n")
        f.write(f"First 200 chars: {pdf_docs[0].page_content[:200]}\n")
    else:
        f.write("ERROR: NO PDF DOCUMENTS IN INDEX!\n")

print("Results written to index_check_results.txt")
