from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ─── CONSTANTS ────────────────────────────────────────────────────────────────

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

def get_location():
    """
    Determines user location based on IP address.
    """
    try:
        response = requests.get("http://ip-api.com/json/")
        data = response.json()
        print(data)
        return {
            "lat": data.get("lat"),
            "lon": data.get("lon"),
            "city": data.get("city"),
            "region": data.get("regionName"),
            "country": data.get("country")
        }
    except Exception as e:
        print(f"[ERROR] Location fetch failed: {e}")
        return None


def get_soil_data(lat, lon):
    """
    Retrieves soil data from ISRIC SoilGrids API.
    """
    try:
        url = (
            f"https://rest.isric.org/soilgrids/v2.0/properties/query"
            f"?lon={lon}&lat={lat}&depth=0-5cm"
            f"&property=phh2o&property=ocd&property=nitrogen&property=phosphorus&property=potassium"
        )
        response = requests.get(url)
        data = response.json()
        layers = data.get("properties", {}).get("layers", {})

        def get_value(layer_name):
            layer = layers.get(layer_name)
            if layer and "depths" in layer and len(layer["depths"]) > 0:
                return layer["depths"][0].get("values", {}).get("mean")
            return None

        print(layers)
        return {
            "soil_ph": get_value("phh2o") or 6.5,
            "soil_oc": get_value("ocd") or 1.2,
            "soil_n": get_value("nitrogen") or 0.1,
            "soil_p": get_value("phosphorus") or 0.05,
            "soil_k": get_value("potassium") or 0.2,
        }
    except Exception as e:
        print(f"[ERROR] Soil data fetch failed: {e}")
        return {
            "soil_ph": 6.5,
            "soil_oc": 1.2,
            "soil_n": 0.1,
            "soil_p": 0.05,
            "soil_k": 0.2,
        }


def get_weather(lat, lon):
    """
    Retrieves current weather data from Open-Meteo.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&current_weather=true&hourly=precipitation,humidity"
        )
        weather = requests.get(url).json()
        return {
            "temp": weather.get("current_weather", {}).get("temperature"),
            "humidity": weather.get("hourly", {}).get("humidity", [50])[0],
            "precip": weather.get("hourly", {}).get("precipitation", [0])[0]
        }
    except Exception as e:
        print(f"[ERROR] Weather data fetch failed: {e}")
        return {
            "temp": None,
            "humidity": 50,
            "precip": 0
        }


def generate_prompt(crop, location, soil, weather):
    """
    Generates a detailed prompt for the LLM based on input parameters.
    """
    return f"""
You are an expert agronomist.

Suggest the best fertilizer(s) for the following crop with the required quantity (kg/ha) and relevant application tips.

Crop: {crop}
Region: {location['city']}, {location['region']}, {location['country']}
Latitude: {location['lat']}, Longitude: {location['lon']}

Soil pH: {soil['soil_ph']}
Organic Carbon (%): {soil['soil_oc']}
Nitrogen level: {soil['soil_n']}
Phosphorus level: {soil['soil_p']}
Potassium level: {soil['soil_k']}

Weather Conditions:
Temperature: {weather['temp']} °C
Humidity: {weather['humidity']} %
Rainfall (last 24h): {weather['precip']} mm

Make sure your answer includes:
1. Fertilizer names
2. Quantity (kg/ha)
3. Application method (e.g., basal, top dressing)
4. Precautions or region-specific tips
    """.strip()


def call_groq_llm(prompt):
    """
    Calls Groq LLM with the given prompt and returns the response.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a smart and region-aware agronomist who helps farmers."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[ERROR] LLM call failed: {e}")
        raise

# ─── ROUTES ───────────────────────────────────────────────────────────────────

@app.route("/api/fertilizer_recommendation", methods=["POST"])
def recommend_fertilizer():
    """
    Recommends fertilizers based on crop, location, soil, and weather data.
    """
    try:
        data = request.json
        crop = data.get("crop")
        if not crop:
            return jsonify({"error": "Missing 'crop' in request"}), 400

        location = get_location()
        if not location:
            return jsonify({"error": "Unable to determine location"}), 500

        lat, lon = location["lat"], location["lon"]
        soil = get_soil_data(lat, lon)
        weather = get_weather(lat, lon)
        prompt = generate_prompt(crop, location, soil, weather)
        recommendation = call_groq_llm(prompt)

        return jsonify({
            "location": location,
            "soil": soil,
            "weather": weather,
            "recommendation": recommendation
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=6000)
