import os
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# ==== CONFIGURATION ====
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or input("Enter your GROQ_API_KEY: ")
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

llm = LLM(
    api_key=GROQ_API_KEY,
    model="groq/llama-3.3-70b-versatile"
)

# ==== VECTOR STORE ====
EMBED_MODEL = "all-MiniLM-L6-v2"
PERSIST_DIR = "../app/chroma_db"
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
agri_advisor = Agent(
    role="Agricultural Advisor",
    goal="Provide optimal crop practices and resource suggestions.",
    backstory="Expert in crop patterns, fertilizers, and modern techniques.",
    tools=[retrieve_context],
    llm=llm,
    verbose=True
)

pest_diagnoser = Agent(
    role="Pest & Disease Assistant",
    goal="Identify possible pests or diseases and suggest treatment.",
    backstory="Expert in crop pathology and pest management.",
    tools=[retrieve_context],
    llm=llm,
    verbose=True
)

organic_expert = Agent(
    role="Organic Farming Advisor",
    goal="Promote eco-friendly farming with natural alternatives.",
    backstory="Experienced organic farmer with in-depth knowledge of sustainable practices.",
    tools=[retrieve_context],
    llm=llm,
    verbose=True
)

govt_scheme_expert = Agent(
    role="Schemes & Subsidy Assistant",
    goal="Inform farmers about relevant schemes and how to apply.",
    backstory="Government schemes specialist for rural development.",
    tools=[retrieve_context],
    llm=llm,
    verbose=True
)

soil_analyzer = Agent(
    role="Soil Health Analyzer",
    goal="Interpret soil health reports and suggest improvements.",
    backstory="Soil scientist trained in analyzing pH, nutrients, and productivity indicators.",
    tools=[retrieve_context],
    llm=llm,
    verbose=True
)

# ==== TASKS ====
tasks = [
    Task(
        description="Give agricultural advice for the query: '{topic}'.",
        expected_output="List of crop practices, irrigation tips, and fertilizer suggestions.",
        agent=agri_advisor
    ),
    Task(
        description="Diagnose pests/diseases and suggest remedies for: '{topic}'.",
        expected_output="List of symptoms, possible pests/diseases, and treatment options.",
        agent=pest_diagnoser
    ),
    Task(
        description="Suggest organic farming practices for: '{topic}'.",
        expected_output="List of eco-friendly farming methods and natural pesticides/fertilizers.",
        agent=organic_expert
    ),
    Task(
        description="Find government schemes related to: '{topic}'.",
        expected_output="List of schemes, benefits, eligibility, and application process.",
        agent=govt_scheme_expert
    ),
    Task(
        description="Analyze soil health for: '{topic}' and suggest improvements.",
        expected_output="Interpretation of soil properties and recommended actions.",
        agent=soil_analyzer
    ),
]

# ==== CREW ====
crew = Crew(
    agents=[agri_advisor, pest_diagnoser, organic_expert, govt_scheme_expert, soil_analyzer],
    tasks=tasks,
    process=Process.sequential,
    verbose=True
)

# ==== RUN ====
if __name__ == "__main__":
    topic = input("Enter your agricultural query (crop, disease, soil report, etc.): ")
    result = crew.kickoff(inputs={"topic": topic})
    print("\n=== SMART AGRICULTURAL ADVISORY OUTPUT ===\n")
    print(result)
