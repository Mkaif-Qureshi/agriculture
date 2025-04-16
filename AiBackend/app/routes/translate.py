from flask import Blueprint, request, jsonify
import os
import fitz  # PyMuPDF
import requests
from dotenv import load_dotenv

load_dotenv()

translate_bp = Blueprint('translate_bp', __name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@translate_bp.route("/translate", methods=["POST"])
def translate_document():
    if 'file' not in request.files:
        return jsonify({"error": "No PDF file provided."}), 400

    pdf_file = request.files['file']
    target_language = request.form.get("target_language")

    if not target_language:
        return jsonify({"error": "No target language specified."}), 400

    try:
        # Extract text from PDF
        text = ""
        with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()

        if not text.strip():
            return jsonify({"error": "PDF appears to be empty or unreadable."}), 400

        # Updated system prompt for simplified explanation
        system_prompt = (
            "You are an expert in explaining agricultural and government documents to rural farmers. "
            "Instead of directly translating, summarize and explain the content in very simple and clear terms "
            f"in the target language ({target_language}). Use a farmer-friendly tone. Preserve any important data or rules, "
            "but avoid complex language. If needed, use bullet points or sections for better clarity."
        )

        prompt = f"Explain the following document in {target_language}:\n\n{text.strip()}"

        # Request to Groq
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.4
        }

        response = requests.post(groq_url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()

        translated_text = result["choices"][0]["message"]["content"]

        return jsonify({"translated_document": translated_text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
