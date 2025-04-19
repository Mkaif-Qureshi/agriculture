from flask import Blueprint, request, jsonify
import os
import base64
import requests
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

plant_disease_bp = Blueprint('plant_disease_bp', __name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Enable CORS for the blueprint
@plant_disease_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@plant_disease_bp.route("/plant-disease", methods=["POST"])
def detect_plant_disease():
    # Debug the incoming request
    print('Content-Type:', request.headers.get('Content-Type', 'No Content-Type header'))
    
    if 'image' not in request.files:
        print('request.files:', request.files)
        return jsonify({"error": "No image file provided."}), 400
    
    try:
        image_file = request.files['image']
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
        
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        diagnosis = result["choices"][0]["message"]["content"]
        return jsonify({"diagnosis": diagnosis}), 200
    
    except requests.exceptions.RequestException as e:
        print(f"API Error: {str(e)}")
        return jsonify({"error": "Error communicating with Groq API. Please try again later."}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500