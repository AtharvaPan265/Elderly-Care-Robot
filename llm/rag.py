# Correct imports for LangChain v0.2+
from langchain_community.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Ensure your Google API key is set
# os.environ["GOOGLE_API_KEY"] = "your-api-key"

# Directory containing your small documents
input_dir = "output_docs"

# Load all text documents
docs = []
for filename in os.listdir(input_dir):
    if filename.endswith(".txt"):
        loader = TextLoader(os.path.join(input_dir, filename))
        docs.extend(loader.load())

# Small child splitter (since files are short)
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

# Google Gemini embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# Vector store for retrieval
vectorstore = Chroma(
    collection_name="small_doc_rag",
    embedding_function=embeddings
)

# In-memory docstore
store = InMemoryStore()

# ParentDocumentRetriever (simplified: only child splitter needed)
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)

# Add the documents for retrieval
retriever.add_documents(docs)

print("LangChain RAG (Gemini) setup complete!")

# Example query
query = "What event involved Jane Doe in 2023?"
retrieved_docs = retriever.invoke(query)

context = "\n\n".join([doc.page_content for doc in retrieved_docs])

# Initialize Gemini chat model
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp")

# Use the retrieved context for RAG
prompt = f"""Use the following context to answer the question.

Context:
{context}

Question: {query}

Answer:"""

response = llm.invoke(prompt)
print(f"\nAnswer: {response.content}")
