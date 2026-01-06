# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from rag_agent import get_answer
# from config import settings

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# @app.route('/health', methods=['GET'])
# def health():
#     """Health check endpoint for deployment platforms."""
#     return jsonify({"status": "healthy", "environment": settings.ENVIRONMENT}), 200

# @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.json
#     question = data.get('question')
    
#     if not question:
#         return jsonify({"error": "No question provided"}), 400
    
#     answer = get_answer(question)
#     return jsonify({"answer": answer})

# if __name__ == '__main__':
#     # Validate settings on startup
#     try:
#         settings.validate()
#     except ValueError as e:
#         print(f"Configuration error: {e}")
#         exit(1)
    
#     print(f"Starting Flask RAG API on {settings.HOST}:{settings.PORT} (debug={settings.DEBUG})...")
#     app.run(host=settings.HOST, port=settings.PORT, debug=settings.DEBUG)


from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_agent import get_answer

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    q = request.json.get("question")
    if not q:
        return jsonify({"error": "No question"}), 400
    return jsonify({"answer": get_answer(q)})

if __name__ == "__main__":
    app.run(port=5000, debug=False)
