# govscheme_bp.py

from flask import Blueprint, request, jsonify
import requests
import os

govscheme_bp = Blueprint('govscheme', __name__)

print(os.environ.get("GROQ_API_KEY"))
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_ID = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """
You are an assistant that helps Indian farmers understand government schemes.

Given a user's query, retrieve and explain relevant schemes in a simple, localized format.

For each scheme, provide:
- **Scheme Name**
- **Eligibility**
- **Benefits**
- **How to Apply** (brief steps)

At the end of your response, include a Markdown-formatted table summarizing all the schemes with the following columns:
| Scheme Name | Eligibility | Benefits | How to Apply |

Ensure the language is clear and avoids jargon.
"""


@govscheme_bp.route('/govscheme', methods=['POST'])
def get_gov_scheme_info():
    try:
        data = request.get_json()
        user_query = data.get("query", "")

        if not user_query:
            return jsonify({"error": "Query not provided"}), 400

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": MODEL_ID,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.7,
            "max_tokens": 1024
        }

        response = requests.post(GROQ_URL, headers=headers, json=payload)

        if response.status_code != 200:
            return jsonify({"error": "Groq API error", "details": response.json()}), 500

        result = response.json()
        answer = result['choices'][0]['message']['content']

        return jsonify({
            "query": user_query,
            "response": answer
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
