from flask import Blueprint, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

postharvest_bp = Blueprint('postharvest_bp', __name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@postharvest_bp.route("/postharvest", methods=["POST"])
def postharvest_instructions():
    data = request.json
    crop = data.get("crop")
    harvest_date = data.get("harvest_date")
    region = data.get("region", "India")  # default region

    if not crop or not harvest_date:
        return jsonify({"error": "Missing 'crop' or 'harvest_date' in request."}), 400

    system_prompt = (
        "You are an agricultural expert specialized in post-harvest handling. "
        "Given the crop, harvest date, and region, provide practical and region-specific post-harvest instructions. "
        "Include tips on drying, grading, storage, packaging, and transport. "
        "Use simple language suitable for farmers. Respond in markdown format with proper sections. "
        "After giving the detailed instructions, also provide a post-harvest activity plan in a markdown table format. "
        "The table should include activities like drying, sorting, packaging, storage, and transport with suggested dates or timeframes based on the harvest date."
    )

    user_prompt = (
        f"Crop: {crop}\n"
        f"Harvest Date: {harvest_date}\n"
        f"Region: {region}\n"
        f"Give specific post-harvest handling tips relevant to this region and crop."
    )

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.5
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"instructions": reply}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
