import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List

# Load environment variables
load_dotenv()

weather_market_bp = Blueprint("weather_market", __name__)

# ✅ Step 1: Define Output Schema using Pydantic
class WeatherInfo(BaseModel):
    city: str
    temperature: str
    condition: str
    humidity: str

class MarketInfo(BaseModel):
    crop: str
    price_per_quintal: str
    market: str

class AgricultureData(BaseModel):
    weather: List[WeatherInfo] = Field(default=[])
    market_prices: List[MarketInfo] = Field(default=[])

parser = PydanticOutputParser(pydantic_object=AgricultureData)

# ✅ Step 2: LangChain + Groq Model Setup
llm = ChatGroq(
    temperature=0,
    model_name="compound-beta",  # Enables web + code tools
    api_key=os.getenv("GROQ_API_KEY")
)

# ✅ Step 3: LangChain Prompt Template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an assistant that gives Indian farmers real-time weather info and market prices."),
    ("user", "Give structured weather reports for {cities} and market prices for {crops} in India. Format output as per schema: {format_instructions}")
])

@weather_market_bp.route("/api/weather-market", methods=["GET"])
def weather_market():
    try:
        cities = request.args.get("cities", "New Delhi").split(",")
        crops = request.args.get("crops", "rice,wheat").split(",")
        cities = [city.strip() for city in cities if city.strip()]
        crops = [crop.strip() for crop in crops if crop.strip()]

        format_instructions = parser.get_format_instructions()

        chain = prompt | llm | parser
        result: AgricultureData = chain.invoke({
            "cities": ", ".join(cities),
            "crops": ", ".join(crops),
            "format_instructions": format_instructions
        })

        return jsonify({
            "success": True,
            "data": result.dict()
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
