from flask import Blueprint, request, jsonify
import requests
import os
import datetime
from dotenv import load_dotenv

from groq import Groq

load_dotenv()

fertilizer_bp= Blueprint('fertilizer', __name__)

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

FERTILIZER_SYSTEM_PROMPT = """
You are a world‑class agronomist and fertilizer specialist advising farmers on optimal nutrient management. 
Given the user’s location (city, region, country, latitude/longitude), soil test data, and current weather conditions, produce a tailored fertilizer recommendation plan. 

In your response:
1. **Soil Analysis Interpretation**  
   - Briefly interpret pH, organic carbon, nitrogen, clay content, and any nutrient imbalances.  
2. **Recommended Fertilizer Types & Ratios**  
   - Specify the ideal N–P–K ratio(s).  
   - Include any secondary (e.g., S, Mg) or micronutrients if warranted.  
3. **Application Rates & Units**  
   - Give precise application rates (e.g., kg/ha or lbs/acre).  
   - Break down per application event if split‑dosing is recommended.  
4. **Timing & Method**  
   - Recommend best timing (pre‑plant, basal, top‑dress) aligned with local climate and crop phenology.  
   - Suggest application methods (broadcast, banding, foliar spray, fertigation).  
5. **Local Context & Cost Considerations**  
   - Highlight locally available fertilizer brands or formulations.  
   - Provide ballpark cost estimates and cost‑benefit comparison.  
6. **Environmental & Safety Precautions**  
   - Warn about leaching/runoff risks in given soil texture and weather.  
   - Recommend best management practices to minimize environmental impact.  
7. **Additional Soil Amendments**  
   - If pH is suboptimal, include liming or acidifying steps.  
   - Suggest organic options (compost, green manures) where beneficial.  
8. **Expected Outcomes**  
   - Estimate yield improvement or crop quality benefits.  
9. **Summary Table**  
   At the end, include a Markdown table with columns:  
   | Component           | Recommendation               | Rate         | Timing/Method               | Notes                            |
   |---------------------|------------------------------|--------------|-----------------------------|----------------------------------|
   | e.g. Urea (46% N)   | Basal + Top‑dress           | 100 kg/ha    | Pre‑plant; 30 days after sowing | Use split application to reduce volatilization |

Use clear, jargon‑free language, and localize units & terminology for Indian farmers.  
"""

# ─── LLM FUNCTION ─────────────────────────────────────────────────────────────

def get_fertilizer_recommendation(data, crop):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    user_prompt = f"""
Provide a fertilizer recommendation for the crop: **{crop}** using the following data:

Location:
City: {data['location']['city']}, Region: {data['location']['region']}, Country: {data['location']['country']}

Soil Data:
- pH: {data['soil_data']['soil_ph']}
- Organic Carbon: {data['soil_data']['soil_organic_carbon']}%
- Nitrogen: {data['soil_data']['soil_nitrogen']}%
- Clay content: {data['soil_data']['soil_clay']}%
- Organic Carbon Stock: {data['soil_data']['soil_organic_carbon_stock']} Mg/ha

Weather Data:
- Temperature: {data['weather_data']['temperature']}°C
- Humidity: {data['weather_data']['humidity']}%
- Precipitation: {data['weather_data']['precipitation']} mm
- Windspeed: {data['weather_data']['windspeed']} km/h

Current Timestamp: {data['timestamp']}

Tailor your advice to the crop {crop} and commercial agricultural standards.
"""

    chat_completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": FERTILIZER_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return chat_completion.choices[0].message.content.strip()

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def get_location():
    try:
        response = requests.get("http://ip-api.com/json/")
        data = response.json()
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
    try:
        url = (
            f"https://api.openepi.io/soil/property?"
            f"lon={lon}&lat={lat}&depths=0-5cm&depths=0-30cm&"
            f"properties=phh2o&properties=nitrogen&properties=soc&properties=clay&"
            f"values=mean"
        )
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        properties = data.get('properties', [])
        soil_data = {
            "soil_ph": None,
            "soil_organic_carbon": None,
            "soil_nitrogen": None,
            "soil_clay": None
        }

        for prop in properties:
            if prop['property'] == 'phh2o':
                soil_data['soil_ph'] = prop['depth_0_5']['mean']
            elif prop['property'] == 'nitrogen':
                soil_data['soil_nitrogen'] = prop['depth_0_5']['mean']
            elif prop['property'] == 'soc':
                soil_data['soil_organic_carbon'] = prop['depth_0_5']['mean']
            elif prop['property'] == 'clay':
                soil_data['soil_clay'] = prop['depth_0_5']['mean']

        ocs_url = (
            f"https://api.openepi.io/soil/property?"
            f"lon={lon}&lat={lat}&depths=0-30cm&properties=ocs&values=mean"
        )
        ocs_response = requests.get(ocs_url)
        if ocs_response.status_code == 200:
            ocs_data = ocs_response.json()
            for prop in ocs_data.get('properties', []):
                if prop['property'] == 'ocs':
                    soil_data['soil_organic_carbon_stock'] = prop['depth_0_30']['mean']

        defaults = {
            "soil_ph": 6.5,
            "soil_organic_carbon": 1.2,
            "soil_nitrogen": 0.1,
            "soil_clay": 20.0,
            "soil_organic_carbon_stock": 50.0
        }

        for key in defaults:
            if soil_data.get(key) is None:
                soil_data[key] = defaults[key]

        return soil_data

    except Exception as e:
        print(f"[ERROR] Soil data fetch failed: {e}")
        return {
            "soil_ph": 6.5,
            "soil_organic_carbon": 1.2,
            "soil_nitrogen": 0.1,
            "soil_clay": 20.0,
            "soil_organic_carbon_stock": 50.0
        }

def get_weather(lat, lon):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m,precipitation"
        )
        response = requests.get(url)
        data = response.json()

        return {
            "temperature": data.get("current_weather", {}).get("temperature", 30),
            "humidity": data.get("hourly", {}).get("relativehumidity_2m", [50])[0],
            "precipitation": data.get("hourly", {}).get("precipitation", [0])[0],
            "windspeed": data.get("current_weather", {}).get("windspeed", 10)
        }
    except Exception as e:
        print(f"[ERROR] Weather data fetch failed: {e}")
        return {
            "temperature": 30,
            "humidity": 50,
            "precipitation": 0,
            "windspeed": 10
        }

# ─── ROUTE 1: FARM DATA (location + soil) ─────────────────────────────────────

@fertilizer_bp.route("/api/farm_data", methods=["GET"])
def farm_data_route():
    try:
        location = get_location()
        if not location:
            return jsonify({"error": "Could not determine location"}), 500

        soil = get_soil_data(location["lat"], location["lon"])
        return jsonify({
            "location": location,
            "soil_data": soil
        })

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# ─── ROUTE 2: FERTILIZER RECOMMENDATION ───────────────────────────────────────

@fertilizer_bp.route("/api/fertilizer_recommendation", methods=["POST"])
def fertilizer_route():
    try:
        req_json = request.get_json()
        crop = req_json.get("crop")
        location = req_json.get("location")
        soil_data = req_json.get("soil_data")

        if not all([crop, location, soil_data]):
            return jsonify({"error": "Missing required fields: crop, location, or soil_data"}), 400

        lat = location.get("lat")
        lon = location.get("lon")
        weather = get_weather(lat, lon)

        input_data = {
            "location": location,
            "soil_data": soil_data,
            "weather_data": weather,
            "timestamp": datetime.datetime.now().isoformat()
        }

        llm_response = get_fertilizer_recommendation(input_data, crop)

        return jsonify({
            "status": "success",
            "crop": crop,
            "location": location,
            "soil_data": soil_data,
            "weather_data": weather,
            "recommendation": llm_response
        })

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
