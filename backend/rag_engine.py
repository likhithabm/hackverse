import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os

class RagEngine:
    def __init__(self, data_path="data/constitution.json"):
        self.data_path = data_path
        print("Loading SentenceTransformer model (this might take a few seconds)...")
        # Load a highly efficient, fast local embedder
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.index = None
        self.documents = []
        self._initialize_index()

    def _initialize_index(self):
        if not os.path.exists(self.data_path):
            print(f"Dataset {self.data_path} not found. RAG will return empty results.")
            return

        with open(self.data_path, 'r', encoding='utf-8') as f:
            self.documents = json.load(f)

        if not self.documents:
            return

        # Prepare text for embedding: title + text
        texts = [f"{doc.get('title', '')}: {doc.get('text', '')}" for doc in self.documents]
        
        # Generate embeddings
        embeddings = self.model.encode(texts, show_progress_bar=False)
        embeddings = np.array(embeddings).astype("float32")

        # Initialize FAISS Index (L2 distance)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings)
        print(f"FAISS index loaded with {self.index.ntotal} documents from {self.data_path}")

    def search(self, query: str, top_k: int = 2):
        if self.index is None or not self.documents:
            return []

        # Embed query
        query_vector = self.model.encode([query])
        query_vector = np.array(query_vector).astype("float32")

        # Search FAISS
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents):
                doc = self.documents[idx]
                results.append({
                    "doc_id": doc.get('doc_id'),
                    "title": doc.get('title'),
                    "text": doc.get('text'),
                    "part": doc.get('part'),
                    "distance": float(distances[0][i])
                })
        return results

# Singleton instance for the backend
rag_engine = RagEngine()
