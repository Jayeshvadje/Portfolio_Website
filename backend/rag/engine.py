"""
RAG (Retrieval-Augmented Generation) Engine
Handles document chunking, similarity retrieval, and response synthesis based on career data.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any

class RAGEngine:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.chunks: List[Dict[str, Any]] = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Loads and chunks knowledge documents (resume_data.md, profile.json)."""
        resume_md_path = self.data_dir / "resume_data.md"
        if resume_md_path.exists():
            text = resume_md_path.read_text(encoding="utf-8")
            # Chunk by markdown headers
            sections = re.split(r'\n(?=## )', text)
            for section in sections:
                if section.strip():
                    lines = section.strip().split("\n")
                    header = lines[0].replace("#", "").strip()
                    self.chunks.append({
                        "source": "resume_data.md",
                        "topic": header,
                        "content": section.strip()
                    })

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves the most relevant context chunks for a given query.
        Uses keyword relevance matching, extensible to vector embeddings.
        """
        query_terms = set(re.findall(r'\w+', query.lower()))
        if not query_terms:
            return self.chunks[:top_k]

        scored_chunks = []
        for chunk in self.chunks:
            chunk_text = (chunk["topic"] + " " + chunk["content"]).lower()
            chunk_terms = set(re.findall(r'\w+', chunk_text))
            
            # Simple term overlap scoring
            overlap = len(query_terms.intersection(chunk_terms))
            # Boost matches in the header topic
            topic_terms = set(re.findall(r'\w+', chunk["topic"].lower()))
            topic_overlap = len(query_terms.intersection(topic_terms))
            
            score = overlap + (topic_overlap * 2)
            if score > 0:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored_chunks[:top_k]]

    def answer_query(self, query: str) -> Dict[str, Any]:
        """
        Produces an accurate, grounded answer using the retrieved context.
        Integrates with LLMs (e.g. Gemini / OpenAI) or provides a deterministic fallback.
        """
        relevant_chunks = self.retrieve(query)
        context_text = "\n\n".join([c["content"] for c in relevant_chunks])

        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            # Here we can call google.generativeai with context + prompt
            pass

        # Grounded response fallback
        if not relevant_chunks:
            answer = (
                "I couldn't find specific information regarding that in my current portfolio knowledge base. "
                "Feel free to ask about my work experience, technical skills, projects, or resume!"
            )
        else:
            answer = f"Here is what I found regarding your query:\n\n{context_text}"

        # Classify intent for interactive card rendering in UI
        q_lower = query.lower()
        res_type = "text"
        if any(w in q_lower for w in ["project", "github", "build"]):
            res_type = "projects"
        elif any(w in q_lower for w in ["skill", "tech", "stack", "tool", "language"]):
            res_type = "skills"
        elif any(w in q_lower for w in ["experience", "career", "job", "company", "background", "role"]):
            res_type = "experience"
        elif any(w in q_lower for w in ["resume", "cv", "download"]):
            res_type = "resume"

        return {
            "answer": answer,
            "retrieved_sources": [c["topic"] for c in relevant_chunks],
            "type": res_type
        }
