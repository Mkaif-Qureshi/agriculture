import os
from flask import Blueprint, request, jsonify
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

agri_advisory_bp = Blueprint('agri_advisory', __name__)

# ==== CONFIGURATION ====
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
llm = LLM(api_key=GROQ_API_KEY, model="groq/llama-3.3-70b-versatile")

# ==== VECTOR STORE ====
EMBED_MODEL = "all-MiniLM-L6-v2"
PERSIST_DIR = "../chroma_db"
COLLECTION = "my_collection"

embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
vectorstore = Chroma(
    persist_directory=PERSIST_DIR,
    embedding_function=embeddings,
    collection_name=COLLECTION
)
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# ==== TOOL ====
@tool("RAG Search Tool")
def retrieve_context(query: str) -> str:
    """Retrieve context from agricultural documents."""
    qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")
    return qa.run(query)

# ==== AGENTS ====
def create_agents():
    return {
        "agri_advisor": Agent(
            role="Agricultural Advisor",
            goal="Provide optimal crop practices and resource suggestions.",
            backstory="Expert in crop patterns, fertilizers, and modern techniques.",
            tools=[retrieve_context],
            llm=llm,
            verbose=True
        ),
        "pest_diagnoser": Agent(
            role="Pest & Disease Assistant",
            goal="Identify possible pests or diseases and suggest treatment.",
            backstory="Expert in crop pathology and pest management.",
            tools=[retrieve_context],
            llm=llm,
            verbose=True
        ),
        "organic_expert": Agent(
            role="Organic Farming Advisor",
            goal="Promote eco-friendly farming with natural alternatives.",
            backstory="Experienced organic farmer with in-depth knowledge of sustainable practices.",
            tools=[retrieve_context],
            llm=llm,
            verbose=True
        ),
        "govt_scheme_expert": Agent(
            role="Schemes & Subsidy Assistant",
            goal="Inform farmers about relevant schemes and how to apply.",
            backstory="Government schemes specialist for rural development.",
            tools=[retrieve_context],
            llm=llm,
            verbose=True
        ),
        "soil_analyzer": Agent(
            role="Soil Health Analyzer",
            goal="Interpret soil health reports and suggest improvements.",
            backstory="Soil scientist trained in analyzing pH, nutrients, and productivity indicators.",
            tools=[retrieve_context],
            llm=llm,
            verbose=True
        )
    }

# ==== CATEGORY CLASSIFIER ====
def classify_topic(topic: str) -> str:
    topic_lower = topic.lower()
    if any(kw in topic_lower for kw in ["pest", "disease", "infection", "infestation", "worm", "fungus"]):
        return "pest"
    elif any(kw in topic_lower for kw in ["organic", "natural", "bio", "eco-friendly"]):
        return "organic"
    elif any(kw in topic_lower for kw in ["scheme", "subsidy", "government", "loan", "kisan"]):
        return "scheme"
    elif any(kw in topic_lower for kw in ["soil", "ph", "nitrogen", "potassium", "fertility"]):
        return "soil"
    else:
        return "agriculture"

# ==== ROUTE ====
@agri_advisory_bp.route('/advisory/ask', methods=['POST'])
def advisory():
    data = request.get_json()
    topic = data.get("topic")

    if not topic:
        return jsonify({"error": "Missing 'topic' in request body"}), 400

    agents = create_agents()
    category = classify_topic(topic)

    category_to_task = {
        "agriculture": Task(
            description=f"Give agricultural advice for the query: '{topic}'.",
            expected_output="List of crop practices, irrigation tips, and fertilizer suggestions.",
            agent=agents["agri_advisor"]
        ),
        "pest": Task(
            description=f"Diagnose pests/diseases and suggest remedies for: '{topic}'.",
            expected_output="List of symptoms, possible pests/diseases, and treatment options.",
            agent=agents["pest_diagnoser"]
        ),
        "organic": Task(
            description=f"Suggest organic farming practices for: '{topic}'.",
            expected_output="List of eco-friendly farming methods and natural pesticides/fertilizers.",
            agent=agents["organic_expert"]
        ),
        "scheme": Task(
            description=f"Find government schemes related to: '{topic}'.",
            expected_output="List of schemes, benefits, eligibility, and application process.",
            agent=agents["govt_scheme_expert"]
        ),
        "soil": Task(
            description=f"Analyze soil health for: '{topic}' and suggest improvements.",
            expected_output="Interpretation of soil properties and recommended actions.",
            agent=agents["soil_analyzer"]
        )
    }

    selected_task = category_to_task[category]
    selected_agent = selected_task.agent

    crew = Crew(
        agents=[selected_agent],
        tasks=[selected_task],
        process=Process.sequential,
        verbose=True
    )

    try:
        result = crew.kickoff(inputs={"topic": topic})
        return jsonify({
            "result": str(result),
            "selected_category": category
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
