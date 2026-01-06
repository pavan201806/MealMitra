# import os
# import re
# from typing import TypedDict, List
# from langgraph.graph import StateGraph, END
# from langchain_openai import ChatOpenAI
# from langchain_community.vectorstores import FAISS
# from langchain_core.documents import Document
# from config import settings

# from langchain_huggingface import HuggingFaceEmbeddings


# # Initialize LLM
# llm = ChatOpenAI(
#     model=settings.OPENAI_MODEL,
#     temperature=settings.OPENAI_TEMPERATURE,
#     api_key=settings.OPENAI_API_KEY
# )

# # Embeddings
# embeddings = HuggingFaceEmbeddings(
#     model_name=settings.EMBEDDING_MODEL
# )
# # Load VectorStore
# vectorstore = None
# index_path = settings.get_index_path()
# if os.path.exists(index_path):
#     try:
#         vectorstore = FAISS.load_local(
#             index_path, embeddings,
#             allow_dangerous_deserialization=True
#         )
#         print(f"✅ Vector store loaded from: {index_path}")
#     except Exception as e:
#         print(f"⚠️  Error loading FAISS index from {index_path}: {e}")
#         print("⚠️  RAG will work but without document retrieval.")
# else:
#     print(f"⚠️  FAISS index not found at: {index_path}")
#     print("⚠️  Run 'python backend/ingest.py' to create the index.")
#     print("⚠️  RAG will work but without document retrieval.")


# # State Structure
# class AgentState(TypedDict):
#     question: str
#     documents: List[Document]
#     answer: str
#     needs_retrieval: bool
#     is_greeting: bool


# # Detect greeting
# def is_greeting(text: str) -> bool:
#     greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
#     text = text.lower().strip()
#     return any(text == g for g in greetings)


# # Decide if retrieval required
# def decide_retrieval(state: AgentState) -> AgentState:
#     q = state["question"]
#     if is_greeting(q):
#         return {**state, "needs_retrieval": False, "is_greeting": True}
#     return {**state, "needs_retrieval": True, "is_greeting": False}


# # FAISS Retrieval
# def retrieve_documents(state: AgentState) -> AgentState:
#     if vectorstore is None:
#         return {**state, "documents": []}

#     question = state["question"].strip()

#     try:
#         docs = vectorstore.similarity_search(question, k=settings.RETRIEVAL_K)
#     except Exception as e:
#         print(f"⚠️  Retrieval error: {e}")
#         docs = []

#     return {**state, "documents": docs}


# # Generate answer from context
# def generate_answer(state: AgentState) -> AgentState:
#     q = state["question"]
#     is_greet = state.get("is_greeting", False)
#     docs = state.get("documents", [])

#     # greet
#     if is_greet:
#         return {**state, "answer": "Hello. How can I help you?"}

#     if not docs:
#         return {**state, "answer": "No relevant information found"}

#     # build context
#     cleaned = []
#     for d in docs:
#         text = d.page_content
#         text = re.sub(r"\n{2,}", "\n", text).strip()
#         if text:
#             cleaned.append(text)

#     context = "\n\n".join(cleaned)

#     prompt = f"""
# Answer ONLY using the context.
# Give a refined answer in one short sentence. Do NOT explain anything extra.
# If context doesn't contain the answer, reply: "No relevant information found."

# Context:
# {context}

# Question:
# {q}

# Answer:
# """

#     try:
#         result = llm.invoke([("user", prompt)]).content.strip()
#     except:
#         result = "No relevant information found"

#     if result == "" or result.lower().startswith("i don't know"):
#         result = "No relevant information found"

#     return {**state, "answer": result}


# # Conditional routing
# def should_retrieve(state: AgentState) -> str:
#     return "retrieve" if state["needs_retrieval"] else "generate"


# # Build graph
# workflow = StateGraph(AgentState)
# workflow.add_node("decide", decide_retrieval)
# workflow.add_node("retrieve", retrieve_documents)
# workflow.add_node("generate", generate_answer)
# workflow.set_entry_point("decide")
# workflow.add_conditional_edges(
#     "decide",
#     should_retrieve,
#     {"retrieve": "retrieve", "generate": "generate"}
# )
# workflow.add_edge("retrieve", "generate")
# workflow.add_edge("generate", END)

# app = workflow.compile()


# # Public API function
# def get_answer(question: str):
#     initial = {
#         "question": question,
#         "documents": [],
#         "answer": "",
#         "needs_retrieval": False,
#         "is_greeting": False,
#     }
#     result = app.invoke(initial)
#     return result["answer"]
import re
import numpy as np
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
from config import settings

# Load embeddings
embeddings = HuggingFaceEmbeddings(
    model_name=settings.EMBEDDING_MODEL
)

# Load FAISS
db = FAISS.load_local(
    settings.get_index_path(),
    embeddings,
    allow_dangerous_deserialization=True
)

def get_answer(question: str) -> str:
    docs = db.similarity_search(question, k=settings.RETRIEVAL_K)

    # 🔎 DEBUG: see what FAISS returns
    for i, d in enumerate(docs):
        print(
            f"[DEBUG] DOC {i} | "
            f"source={d.metadata.get('source')} | "
            f"page={d.metadata.get('page')}"
        )

    if not docs:
        return "No relevant information found."

    # 🔹 Split into sentences
    sentences = []
    sources = []

    for doc in docs:
        text = doc.page_content
        split = re.split(r'(?<=[.!?])\s+', text)

        for s in split:
            s = s.strip()
            if len(s) > 20:
                sentences.append(s)
                sources.append(doc.metadata.get("source", "txt"))

    if not sentences:
        return "No relevant information found."

    # 🔹 Embed question + sentences
    q_emb = embeddings.embed_query(question)
    s_embs = embeddings.embed_documents(sentences)

    # 🔹 Cosine similarity
    scores = cosine_similarity([q_emb], s_embs)[0]
    best_idx = int(np.argmax(scores))

    answer = sentences[best_idx]

    return answer
