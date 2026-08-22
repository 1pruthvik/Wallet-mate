import os

RAG_VECTOR_STORE_PATH = os.getenv("RAG_VECTOR_STORE_PATH", "./data/vectorstore")
RAG_COLLECTION_NAME = os.getenv("RAG_COLLECTION_NAME", "finmitra_knowledge")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
RAG_RERANK_TOP_K = int(os.getenv("RAG_RERANK_TOP_K", "3"))
RAG_EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "local_tfidf_hashing")
