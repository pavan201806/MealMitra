import sys
import os
import logging

# Setup path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Configure logging to see RAG internals if needed
logging.basicConfig(level=logging.ERROR)

print("⏳ Initializing RAG Agent for test...")
try:
    from backend import rag_agent
    from backend.config import settings
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings

    print(f"📂 Index path: {settings.get_index_path()}")
    
    query = "What is caffeine?"
    print(f"❓ Querying: '{query}'")
    
    answer = rag_agent.get_answer(query)
    print(f"💡 Answer: {answer}")

    # Manual retrieval check
    print("\n🔍 Debugging Retrieval directly from FAISS...")
    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    
    if os.path.exists(settings.get_index_path()):
        vectorstore = FAISS.load_local(settings.get_index_path(), embeddings, allow_dangerous_deserialization=True)
        docs = vectorstore.similarity_search("caffeine", k=settings.RETRIEVAL_K)
        print(f"✅ Found {len(docs)} documents for query 'caffeine'")
        for i, d in enumerate(docs[:3]):
            print(f"--- Doc {i+1} (Source: {os.path.basename(d.metadata.get('source', 'unknown'))}) ---")
            content_preview = d.page_content[:200].replace('\n', ' ')
            print(f"Content: {content_preview}...")
    else:
        print(f"❌ Index not found at {settings.get_index_path()}")

except Exception as e:
    print(f"❌ Error during test: {e}")
    import traceback
    traceback.print_exc()
