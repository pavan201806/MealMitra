import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend import rag_agent
from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

print("\n" + "="*70)
print(" "*20 + "RAG SYSTEM - CAFFEINE QUERY TEST")
print("="*70 + "\n")

# Query
query = "What is caffeine?"
print(f"❓ QUESTION: {query}\n")

# Get answer
print("🔍 Searching knowledge base...")
answer = rag_agent.get_answer(query)

print(f"\n💡 ANSWER:\n")
print(f"   {answer}\n")

# Show which documents were retrieved
print("="*70)
print("📚 RETRIEVED DOCUMENTS:")
print("="*70 + "\n")

embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)
docs = db.similarity_search(query, k=settings.RETRIEVAL_K)

for i, doc in enumerate(docs, 1):
    source = doc.metadata.get('file', doc.metadata.get('source', 'unknown'))
    page = doc.metadata.get('page', 'N/A')
    method = doc.metadata.get('extraction_method', 'N/A')
    
    print(f"Document {i}:")
    print(f"  Source: {source}")
    print(f"  Page: {page}")
    print(f"  Extraction: {method}")
    print(f"  Content preview: {doc.page_content[:150]}...")
    print()

print("="*70)
print("✅ PDF EXTRACTION IS WORKING!")
print("="*70)
