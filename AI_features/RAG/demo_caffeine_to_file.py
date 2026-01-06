import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend import rag_agent
from backend.config import settings
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# Write output to file
with open("caffeine_test_results.txt", "w", encoding="utf-8") as f:
    f.write("="*70 + "\n")
    f.write(" "*20 + "RAG SYSTEM - CAFFEINE QUERY TEST\n")
    f.write("="*70 + "\n\n")

    # Query
    query = "What is caffeine?"
    f.write(f"QUESTION: {query}\n\n")

    # Get answer
    f.write("Searching knowledge base...\n\n")
    answer = rag_agent.get_answer(query)

    f.write(f"ANSWER:\n")
    f.write(f"{answer}\n\n")

    # Show which documents were retrieved
    f.write("="*70 + "\n")
    f.write("RETRIEVED DOCUMENTS:\n")
    f.write("="*70 + "\n\n")

    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    db = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)
    docs = db.similarity_search(query, k=settings.RETRIEVAL_K)

    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get('file', doc.metadata.get('source', 'unknown'))
        page = doc.metadata.get('page', 'N/A')
        method = doc.metadata.get('extraction_method', 'N/A')
        
        f.write(f"Document {i}:\n")
        f.write(f"  Source: {source}\n")
        f.write(f"  Page: {page}\n")
        f.write(f"  Extraction Method: {method}\n")
        f.write(f"  Content: {doc.page_content[:300]}\n")
        f.write("\n")

    f.write("="*70 + "\n")
    f.write("SUCCESS! PDF EXTRACTION IS WORKING!\n")
    f.write("="*70 + "\n")

print("Results written to caffeine_test_results.txt")
