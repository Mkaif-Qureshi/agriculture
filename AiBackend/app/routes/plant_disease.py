from flask import Blueprint, request, jsonify
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

plant_disease_bp = Blueprint('plant_disease_bp', __name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@plant_disease_bp.route("/plant-disease", methods=["POST"])
def detect_plant_disease():
    if 'file' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    image_file = request.files['file']
    image_bytes = image_file.read()
    encoded_image = base64.b64encode(image_bytes).decode('utf-8')

    prompt = (
        "You are an agricultural expert. Analyze the uploaded image of a plant or leaf and identify any diseases, pests, or deficiencies present. "
        "Provide the diagnosis in simple terms suitable for farmers, including the name of the issue, symptoms, and recommended treatments or precautions. "
        "Format the response in markdown."
    )

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
            ]}
        ],
        "temperature": 0.4
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        diagnosis = result["choices"][0]["message"]["content"]
        return jsonify({"diagnosis": diagnosis}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
