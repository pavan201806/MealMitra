from rag_agent import get_answer

def test_rag():
    questions = [
        "Hello",
        "What is in the agriculture document?",
        "Who is the president of Mars?",
        "Tell me about Python."
    ]
    
    for q in questions:
        print(f"Q: {q}")
        ans = get_answer(q)
        print(f"A: {ans}")
        print("-" * 30)

if __name__ == "__main__":
    test_rag()
