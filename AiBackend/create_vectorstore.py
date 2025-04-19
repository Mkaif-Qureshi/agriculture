import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_mistralai import ChatMistralAI
from langchain_community.vectorstores import Chroma

# Path to your folder containing only PDFs
pdf_folder_path = "./app/data/"

# Initialize LLM
llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0,
)

# Function to load documents only from PDF files
def load_pdfs_from_folder(pdf_path):
    documents = []
    for filename in os.listdir(pdf_path):
        if filename.endswith(".pdf"):
            file_path = os.path.join(pdf_path, filename)
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
    return documents

# Load documents from the PDF folder
documents = load_pdfs_from_folder(pdf_folder_path)

print(f"Total PDF documents loaded: {len(documents)}")

# Split documents into chunks with overlap
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
)
split_documents = text_splitter.split_documents(documents)

# Initialize embedding function
embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Set Chroma vector store config
collection_name = "my_collection"
persist_directory = "./app/chroma_db"

# Create and persist the vector store
vectorstore = Chroma.from_documents(
    documents=split_documents,
    embedding=embedding_function,
    collection_name=collection_name,
    persist_directory=persist_directory
)

vectorstore.persist()

# Optional: Set up the retriever
retriever = vectorstore.as_retriever()

print(f"Vector store created and persisted to '{persist_directory}'")
