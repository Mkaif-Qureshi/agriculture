import os
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain.embeddings import HuggingFaceEmbeddings  # Use HuggingFace embeddings or another embedding model
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain_mistralai import ChatMistralAI
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Chroma

# Paths to your folders containing documents
pdf_folder_path = "./data/"
txt_folder_path = "./app/data/webdoc/"

# Initialize LLM
llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0,
)

# Function to load documents from PDF, DOCX, and TXT files
def load_documents_from_folders(pdf_path, txt_path):
    documents = []

    # Load PDF files
    for filename in os.listdir(pdf_path):
        if filename.endswith(".pdf"):
            file_path = os.path.join(pdf_path, filename)
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())

    # Load TXT files
    for filename in os.listdir(txt_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(txt_path, filename)
            loader = TextLoader(file_path, encoding="utf-8")  # Specify encoding to handle Unicode issues
            documents.extend(loader.load())

    return documents

# Load documents from the folders
documents = load_documents_from_folders(pdf_folder_path, txt_folder_path)

print(len(documents))

# Use RecursiveCharacterTextSplitter to split documents into chunks with overlap
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # Maximum size of each chunk
    chunk_overlap=150,  # Overlap between chunks
)
split_documents = text_splitter.split_documents(documents)

# Initialize the embedding function for Chroma
embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Define the collection name for Chroma
collection_name = "my_collection"
# Define the path where the vector store should be persisted
persist_directory = "./app/chroma_db"

# Create the vector store using Chroma and specify the persist directory
vectorstore = Chroma.from_documents(
    documents=split_documents,  # The split documents
    embedding=embedding_function,  # The embedding function
    collection_name=collection_name,  # Name of the collection
    persist_directory=persist_directory  # Path to store the vector store
)

# Persist the vector store to the specified directory
vectorstore.persist()

# Set up the retriever
retriever = vectorstore.as_retriever()

# Print confirmation message
print(f"Vector store created and persisted to '{persist_directory}'")
