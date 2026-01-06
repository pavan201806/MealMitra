import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend import rag_agent

print("="*60)
print("TESTING RAG SYSTEM WITH CAFFEINE QUERY")
print("="*60)

query = "What is caffeine?"
print(f"\n❓ Question: {query}\n")

answer = rag_agent.get_answer(query)

print(f"💡 Answer: {answer}\n")
print("="*60)
